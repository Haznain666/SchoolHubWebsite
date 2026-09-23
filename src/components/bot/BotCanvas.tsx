import { Suspense, useEffect, useRef, type MutableRefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { ACESFilmicToneMapping, SRGBColorSpace, type DirectionalLight, type Group } from 'three';

import { BotModel } from './BotModel';
import { SceneRig } from './SceneRig';
import type { PointerState } from '../../hooks/usePointer';
import type { ScenePreset } from '../../data/sections';

interface Props {
  presetRef: MutableRefObject<ScenePreset>;
  pointer: MutableRefObject<PointerState>;
  /** raised once the model is on screen, so the PNG placeholder can fade out */
  onReady: () => void;
  /** phone framing: pulled back, centred, and rendered at a lower pixel ratio */
  compact: boolean;
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

/**
 * The 3D layer (CHANGES-V2 §B.2). This whole module is a lazily imported chunk
 * — nothing here is in the first-paint bundle, and on reduced motion, a coarse
 * pointer or a machine without WebGL2 it is never imported at all.
 *
 * Lighting follows `Bot images/1.jpg`: a key, a rim, a low fill and a small
 * local studio environment (built from <Lightformer>s, not a fetched HDRI —
 * nothing here touches the network beyond the model and the bundled Draco
 * decoder) so the metal has something to reflect.
 *
 * THERE IS NO BLOOM PASS, deliberately. It was tuned twice and removed on the
 * third complaint. The problem is that `luminanceThreshold` is applied AFTER
 * ACES tone mapping, which compresses everything bright into a narrow band
 * near 1.0: polished chrome specular and the emissive cyan both land at
 * ~0.93-0.98, so no threshold can separate them. Any bloom strong enough to
 * light the eyes also veiled the whole body — the "white glaze". The eyes and
 * chest ring still read as lit because the material patch pushes their
 * emissive to 1.6x; they do not need a bloom pass to glow, and the neon in the
 * composition comes from <HaloLayer> behind the bot, not from the model.
 *
 * Antialiasing is the canvas's own `antialias: true` again now the composer
 * (and its `multisampling`) is gone.
 */
export default function BotCanvas({ presetRef, pointer, onReady, compact }: Props) {
  const modelRef = useRef<Group | null>(null);
  const keyRef = useRef<DirectionalLight | null>(null);
  const rimRef = useRef<DirectionalLight | null>(null);

  return (
    <Canvas
      // A phone's device pixel ratio is routinely 3. Rendering a full-screen
      // WebGL canvas at 3x on a handset is the single most expensive thing on
      // this page, and the model is at 0.42 opacity behind the copy there, so
      // the detail is not visible anyway. 1.5 is the ceiling that keeps the
      // silhouette clean without heating the phone.
      dpr={compact ? [1, 1.5] : [1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      }}
      frameloop="always"
      camera={{ fov: 27, near: 0.1, far: 100, position: [0, 0, 6] }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.04;
        gl.outputColorSpace = SRGBColorSpace;
        gl.setClearAlpha(0);
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        {/* fill — keeps the shadow side of the metal from going black */}
        <hemisphereLight args={['#ffffff', '#c7d2e0', 0.55]} />
        <ambientLight intensity={0.3} />

        <directionalLight ref={keyRef} intensity={2.4} color="#ffffff" position={[3, 3, 3]} />
        {/* the rim used to run at 3.4 and drew a bright white line right round
            the silhouette, which read as part of the same white glaze */}
        <directionalLight ref={rimRef} intensity={2.3} color="#e4f2ff" position={[-3, 1.6, -3]} />
        {/* a low, cool bounce from underneath, as in 1.jpg */}
        <directionalLight intensity={0.6} color="#b9d4ff" position={[0, -3, 1.5]} />

        {/*
          A local studio, not a fetched HDRI. The body is fully metallic, so
          almost all of its colour is reflection: without a bright, near-neutral
          surround the gunmetal renders navy instead of the brushed silver in
          `1.jpg`. The flat background below is what does most of that work; the
          lightformers only add the highlights and the edge.
        */}
        <Environment resolution={256} frames={1}>
          <color attach="background" args={['#ccd6e2']} />
          <Lightformer intensity={2.4} color="#ffffff" position={[0, 4, 3]} scale={[9, 4, 1]} />
          <Lightformer
            intensity={1.5}
            color="#f2f7ff"
            position={[-4, 1, -3]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[7, 7, 1]}
          />
          <Lightformer
            intensity={1.3}
            color="#ffffff"
            position={[4, 0.5, -2]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[7, 7, 1]}
          />
          <Lightformer
            intensity={0.8}
            color="#cfe8ff"
            position={[0, -3, 2]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[9, 9, 1]}
          />
        </Environment>

        <BotModel ref={modelRef} />
        <SceneRig
          presetRef={presetRef}
          pointer={pointer}
          modelRef={modelRef}
          keyRef={keyRef}
          rimRef={rimRef}
          compact={compact}
        />
        <Ready onReady={onReady} />

      </Suspense>
    </Canvas>
  );
}
