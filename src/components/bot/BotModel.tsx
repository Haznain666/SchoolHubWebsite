import { forwardRef, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import {
  Box3,
  Group,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector3,
  type Texture,
} from 'three';

import { MODEL_URL } from '../../lib/asset';

/**
 * The 3D bot (CHANGES-V2 §B).
 *
 * The `.glb` is a single Draco-compressed mesh with one PBR material — no
 * skeleton, so there is no head bone to drive separately and the cursor-follow
 * offsets in §B.4 are applied to the whole model by <SceneRig>.
 *
 * Two things happen here and nowhere else:
 *
 * 1. **Normalisation.** The bounding box is measured at runtime, the model is
 *    recentred on the origin and scaled so its largest dimension is exactly one
 *    unit. Every number in §D assumes that. Measuring rather than hard-coding
 *    the ~0.53 factor means a re-exported model cannot silently change the
 *    framing of all fifteen sections.
 *
 * 2. **The cyan emissive.** `1.jpg` wants brushed gunmetal with *lit* cyan eyes
 *    and accent rings, but the model ships one material for the whole body, so
 *    there is nothing to assign an emissive to. The base-colour texture,
 *    however, is neutral grey everywhere except those accents, so the shader is
 *    patched to derive emissive from how cyan a texel is. Grey metal scores
 *    zero and stays metal; the eyes and rings light up and clear the bloom
 *    threshold.
 */

/** Bundled Draco decoder — never the CDN (CHANGES-V2 §M). */
export const DRACO_PATH = `${import.meta.env.BASE_URL}draco/`;

// drei's `useGLTF` defaults to a Google-hosted decoder. Pin it here *and* pass
// the path explicitly at the call site, so the CDN can never be reached.
useGLTF.setDecoderPath(DRACO_PATH);

/**
 * Injected after the base-colour texture has been sampled.
 *
 * The multiplier was 2.9 while a bloom pass existed to bloom it. With bloom
 * gone it was simply too hot: ACES compresses anything far above 1.0 toward
 * white, so the eyes — the largest, most saturated cyan area in the texture —
 * clipped to white discs, while the smaller chest ring stayed cyan. 1.6 keeps
 * the emissive inside the part of the curve that still carries hue, so the
 * eyes read as bright cyan rather than as white.
 */
const EMISSIVE_PATCH = /* glsl */ `
  #include <emissivemap_fragment>
  {
    float cyanness = (diffuseColor.g + diffuseColor.b) * 0.5 - diffuseColor.r * 1.35;
    cyanness = smoothstep(0.10, 0.42, cyanness);
    totalEmissiveRadiance += vec3(0.0, 0.88, 0.97) * cyanness * 1.6;
  }
`;

function patchMaterial(material: MeshStandardMaterial): void {
  if (material.userData.schoolhubPatched) return;
  material.userData.schoolhubPatched = true;

  // Polished gunmetal, not brushed. The client asked for "shiny, glossy and
  // beautiful", which on a fully metallic body is almost entirely a roughness
  // and envMapIntensity question: reflections carry the gloss, not lighting.
  // Emissive parts are left alone — the shader patch below owns those.
  // 1.9 was the other half of the "white glaze": the body is fully metallic,
  // so nearly all of its colour is reflected environment, and at 1.9 it
  // reflected the pale studio back hot enough to look milk-washed. 1.25 keeps
  // it mirror-bright — gloss comes from `metalness` and `roughness`, not from
  // how hard the surround is driven — without bleaching the gunmetal.
  material.envMapIntensity = 1.25;
  if (material.metalness !== undefined && material.metalness > 0.2) {
    material.metalness = 1;
    material.roughness = Math.min(material.roughness ?? 0.4, 0.18);
  }
  const map = material.map as Texture | null;
  if (map) map.colorSpace = SRGBColorSpace;

  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      EMISSIVE_PATCH,
    );
  };
  material.needsUpdate = true;
}

/**
 * The model, normalised into a unit box and centred on the origin. The ref is
 * the *pose* group — <SceneRig> writes the damped §D position and rotation
 * straight onto it every frame.
 */
export const BotModel = forwardRef<Group>(function BotModel(_props, ref) {
  const gltf = useGLTF(MODEL_URL, DRACO_PATH);
  const object = gltf.scene;

  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(object);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const largest = Math.max(size.x, size.y, size.z) || 1;
    const s = 1 / largest;
    return {
      scale: s,
      offset: [-centre.x * s, -centre.y * s, -centre.z * s] as [number, number, number],
    };
  }, [object]);

  useEffect(() => {
    object.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      // the model is deliberately cropped by the frame edges (§B.3); frustum
      // culling on a single large mesh would pop it out at the extremes
      mesh.frustumCulled = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if ((m as MeshStandardMaterial).isMeshStandardMaterial) {
          patchMaterial(m as MeshStandardMaterial);
        }
      });
    });
  }, [object]);

  return (
    <group ref={ref}>
      <group scale={scale} position={offset}>
        <primitive object={object} />
      </group>
    </group>
  );
});

useGLTF.preload(MODEL_URL, DRACO_PATH);
