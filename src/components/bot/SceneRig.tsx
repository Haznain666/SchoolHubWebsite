import { useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { DirectionalLight, Group, PerspectiveCamera, Vector3 } from 'three';

import { DAMPING, clampDt, damp, dampAngle } from '../../lib/damp';
import type { PointerState } from '../../hooks/usePointer';
import { framedDistance, type ScenePreset } from '../../data/sections';

/**
 * §B.4 — the bot tracks the pointer, lagging it slightly.
 *
 * The spec's ±0.12 / ±0.08 rad is about 7° / 5°, which on a subject filling
 * most of the viewport is almost imperceptible — the client's note was that
 * the bot "hardly moves with the mouse", and following the cursor is the
 * point of the hero. Raised to ~26° / ~14°, with a small lateral drift so
 * the whole body shifts rather than only pivoting on the spot, and a faster
 * rate so it feels attached to the cursor instead of trailing it.
 */
const HEAD_YAW = 0.46; // rad ≈ 26°
const HEAD_PITCH = 0.25; // rad ≈ 14°
const HEAD_DRIFT = 0.12; // model units of lateral sway
const HEAD_RATE = 6.5;

/** Key and rim orbit with the camera so the bot is always modelled, never flat. */
const KEY_OFFSET = 0.85; // rad ahead of the camera's azimuth
const RIM_OFFSET = 2.65; // rad behind — the strong edge light from `1.jpg`

/**
 * Phone framing.
 *
 * The §D table frames a landscape viewport where the copy column and the bot
 * own different halves of the screen: the model is pushed a long way along the
 * camera's right vector so it clears the text. A phone has one column and the
 * bot is directly behind the words, so both of those numbers are wrong there —
 * the lateral offset throws the model off the side of a 390px viewport, and
 * the framing distance, applied to a portrait aspect, fills the screen with
 * it.
 *
 * `PULL_BACK` multiplies the framed distance, so the bot reads as an object in
 * the composition rather than a wall behind it. `LATERAL` collapses the
 * sideways offset almost to nothing so it stays centred whatever the section
 * asked for, and `VERTICAL` keeps a little of each preset's rise and fall —
 * zeroing it flattened the sections that deliberately sit the bot low.
 */
const COMPACT = { PULL_BACK: 1.62, LATERAL: 0.12, VERTICAL: 0.4 } as const;

interface Props {
  presetRef: MutableRefObject<ScenePreset>;
  pointer: MutableRefObject<PointerState>;
  modelRef: MutableRefObject<Group | null>;
  keyRef: MutableRefObject<DirectionalLight | null>;
  rimRef: MutableRefObject<DirectionalLight | null>;
  /** phone framing — see COMPACT above */
  compact: boolean;
}

/**
 * The whole of the scene's motion (CHANGES-V2 §C + §D), evaluated per frame.
 *
 * Nothing here is tweened. Every channel is exponentially damped toward the
 * active section's preset at its own rate, so the camera position (6.4) lands
 * before the look-at point (7.6) has settled, the roll (4.9) trails both and
 * the lights (3.4) arrive last — the scene never assembles all at once and
 * never snaps to a stop. Because the approach is asymptotic it is also still
 * moving a little while you sit on a section, which is why there is no
 * separate idle loop.
 *
 * `dt` is clamped, so a tab that has been in the background does not hand back
 * a half-second frame and teleport the camera.
 */
export function SceneRig({ presetRef, pointer, modelRef, keyRef, rimRef, compact }: Props) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;

  // live (damped) state — mutated in place so the loop allocates nothing
  //
  // The camera is damped in ORBIT space, not in world XYZ. Damping the
  // Cartesian position interpolates along the chord between two points on the
  // orbit sphere, and a chord always passes nearer the origin than the arc
  // does: between two sections whose azimuths sit on opposite sides the camera
  // dived towards the model mid-transition, so the bot ballooned to fill the
  // frame and then shrank back. Damping azimuth, elevation and distance
  // separately keeps every intermediate frame on a sphere whose radius only
  // ever moves between the two presets' own distances, so the bot's apparent
  // size is monotonic across a transition and can never overshoot either end.
  const orbit = useRef({ az: 0, el: 0, dist: 6 });
  const camTarget = useRef(new Vector3(0, 0, 0));
  const camRoll = useRef(0);
  const camFov = useRef(27);
  const modelPos = useRef(new Vector3(0, 0, 0));
  const modelRot = useRef({ yaw: 0, pitch: 0, roll: 0 });
  const head = useRef({ yaw: 0, pitch: 0 });
  const lightAz = useRef(0);
  const started = useRef(false);

  useFrame((_state, rawDt) => {
    const dt = clampDt(rawDt);
    const { camera: c, model: m } = presetRef.current;

    const targetDistance = framedDistance(c.distance) * (compact ? COMPACT.PULL_BACK : 1);
    const targetModelX = m.position[0] * (compact ? COMPACT.LATERAL : 1);
    const targetModelY = m.position[1] * (compact ? COMPACT.VERTICAL : 1);

    // first frame: snap, so the page does not open mid-swoop
    if (!started.current) {
      started.current = true;
      orbit.current.az = c.azimuth;
      orbit.current.el = c.elevation;
      orbit.current.dist = targetDistance;
      camTarget.current.set(c.focus[0], c.focus[1], c.focus[2]);
      camRoll.current = c.roll;
      camFov.current = c.fov;
      modelPos.current.set(targetModelX, targetModelY, m.position[2]);
      modelRot.current = { yaw: m.yaw, pitch: m.pitch, roll: m.roll };
      lightAz.current = c.azimuth;
    }

    /* ---- camera ---------------------------------------------------- */
    const o = orbit.current;
    o.az = dampAngle(o.az, c.azimuth, DAMPING.camPos, dt);
    o.el = damp(o.el, c.elevation, DAMPING.camPos, dt);
    o.dist = damp(o.dist, targetDistance, DAMPING.camPos, dt);

    camTarget.current.x = damp(camTarget.current.x, c.focus[0], DAMPING.camTarget, dt);
    camTarget.current.y = damp(camTarget.current.y, c.focus[1], DAMPING.camTarget, dt);
    camTarget.current.z = damp(camTarget.current.z, c.focus[2], DAMPING.camTarget, dt);

    camRoll.current = damp(camRoll.current, c.roll, DAMPING.camRoll, dt);

    const fov = damp(camFov.current, c.fov, DAMPING.camFov, dt);
    if (Math.abs(camera.fov - fov) > 1e-4) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    camFov.current = fov;

    // `orbitToPosition` is not used here: it returns a fresh array, and this
    // runs every frame. Same formula, written straight into the camera.
    const ce = Math.cos(o.el);
    camera.position.set(o.dist * ce * Math.sin(o.az), o.dist * Math.sin(o.el), o.dist * Math.cos(o.az) * ce);
    camera.up.set(0, 1, 0);
    camera.lookAt(camTarget.current);
    // roll is a rotation about the camera's own forward axis, applied after the
    // look-at so it cannot be undone by it
    camera.rotateZ(camRoll.current);

    /* ---- model ------------------------------------------------------ */
    const group = modelRef.current;
    if (group) {
      modelPos.current.x = damp(modelPos.current.x, targetModelX, DAMPING.modelPos, dt);
      modelPos.current.y = damp(modelPos.current.y, targetModelY, DAMPING.modelPos, dt);
      modelPos.current.z = damp(modelPos.current.z, m.position[2], DAMPING.modelPos, dt);

      const r = modelRot.current;
      r.yaw = damp(r.yaw, m.yaw, DAMPING.modelRot, dt);
      r.pitch = damp(r.pitch, m.pitch, DAMPING.modelRot, dt);
      r.roll = damp(r.roll, m.roll, DAMPING.modelRot, dt);

      // §B.4 — the cursor offset composes *on top of* the damped section pose,
      // it never replaces it
      const p = pointer.current;
      head.current.yaw = damp(head.current.yaw, p.x * HEAD_YAW, HEAD_RATE, dt);
      head.current.pitch = damp(head.current.pitch, p.y * HEAD_PITCH, HEAD_RATE, dt);

      // the lateral sway rides on the same damped value, so the body follows
      // the cursor bodily and the turn does not read as a detached head
      group.position.set(
        modelPos.current.x + head.current.yaw * HEAD_DRIFT,
        modelPos.current.y - head.current.pitch * HEAD_DRIFT * 0.6,
        modelPos.current.z,
      );
      group.rotation.set(r.pitch + head.current.pitch, r.yaw + head.current.yaw, r.roll);

      // Dev only, stripped from the production bundle. The §D sign conventions
      // (negative turn = screen-left, negative pitch = chin up) have been got
      // backwards more than once, and a screenshot cannot settle it when the
      // preview pane is hidden and captures come back blank. This hands the
      // live camera and pose to the console so a gaze can be *projected* and
      // compared against the heading's DOM rect rather than eyeballed.
      if (import.meta.env.DEV) {
        (window as unknown as { __schoolhubScene?: unknown }).__schoolhubScene = {
          camera,
          model: group,
        };
      }
    }

    /* ---- lights: the slowest channel, so they arrive last ------------ */
    lightAz.current = damp(lightAz.current, c.azimuth, DAMPING.light, dt);
    const az = lightAz.current;
    const key = keyRef.current;
    if (key) key.position.set(Math.sin(az + KEY_OFFSET) * 4, 3.1, Math.cos(az + KEY_OFFSET) * 4);
    const rim = rimRef.current;
    if (rim) rim.position.set(Math.sin(az + RIM_OFFSET) * 4.4, 1.6, Math.cos(az + RIM_OFFSET) * 4.4);
  });

  return null;
}
