/**
 * Frame-rate-independent exponential damping (CHANGES-V2 §C).
 *
 * Every scene transition in revision 2 is evaluated per frame with this, not
 * tweened over a fixed duration. Three properties fall out of it and all three
 * are wanted:
 *
 *   1. It cannot judder. `dt` is in the exponent, so a dropped frame changes
 *      nothing about the curve — which is the fix for "it's jerky".
 *   2. Channels settle at different times (rotation 7.6 lands before the lights
 *      at 3.4), so nothing arrives all at once and nothing snaps to a stop.
 *   3. It never truly finishes. The asymptotic approach *is* the "keeps
 *      animating while you sit on a section" quality — no separate idle loop
 *      is needed to fake it, and none is added.
 */

/** The shipped rates from the inspiration site. Used as-is. */
export const DAMPING = {
  camPos: 6.4,
  camTarget: 7.6,
  camRoll: 4.9,
  camFov: 5.6,
  modelPos: 6.8,
  modelRot: 7.6,
  halo: 5.1,
  light: 3.4,
} as const;

/**
 * A backgrounded tab hands back a huge `dt` on its first frame. Clamping it
 * here is what stops the camera teleporting on return.
 */
export const MAX_DT = 1 / 30;

export const clampDt = (dt: number): number => (dt > MAX_DT ? MAX_DT : dt < 0 ? 0 : dt);

export const damp = (current: number, target: number, rate: number, dt: number): number =>
  current + (target - current) * (1 - Math.exp(-rate * dt));

/** Smoothstep — the easing for any blend factor between two presets (§C). */
export const smoothstep = (t: number): number => {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
};

export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

/** A damped 3-vector, mutated in place so the rAF loop allocates nothing. */
export interface Damped3 {
  x: number;
  y: number;
  z: number;
}

export const damp3 = (
  out: Damped3,
  tx: number,
  ty: number,
  tz: number,
  rate: number,
  dt: number,
): void => {
  const k = 1 - Math.exp(-rate * dt);
  out.x += (tx - out.x) * k;
  out.y += (ty - out.y) * k;
  out.z += (tz - out.z) * k;
};

/**
 * Camera position from the orbital coordinates in the §D table. `azimuth` 0
 * puts the camera on +Z looking back at the origin.
 */
export const orbitToPosition = (
  azimuth: number,
  elevation: number,
  distance: number,
): [number, number, number] => {
  const ce = Math.cos(elevation);
  return [
    distance * ce * Math.sin(azimuth),
    distance * Math.sin(elevation),
    distance * ce * Math.cos(azimuth),
  ];
};

/** A full turn, for the shortest-path wrap below. */
const TAU = Math.PI * 2;

/**
 * Damping for an angle, taking the short way round.
 *
 * Damping an azimuth as a plain number makes the camera unwind the long way
 * whenever two sections sit either side of the +/-PI seam — 3.0 rad to -3.0 rad
 * is a 0.28 rad step across the seam, but arithmetic says 6.0 and swings the
 * camera right through the back of the scene. The difference is wrapped into
 * (-PI, PI] first, so only the short arc is ever travelled.
 */
export const dampAngle = (current: number, target: number, rate: number, dt: number): number => {
  const delta = (((target - current + Math.PI) % TAU) + TAU) % TAU - Math.PI;
  return current + delta * (1 - Math.exp(-rate * dt));
};
