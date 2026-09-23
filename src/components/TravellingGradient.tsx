/**
 * The travelling pulse that lights a flow line (CHANGES-V2 §I).
 *
 * A narrow bright band is swept along the stroke, then parked off-stage for the
 * rest of the cycle — that pause is the gap between pulses, and the easing on
 * the travel segment is the reference's [.16, 1, .3, 1]. Declarative SMIL
 * rather than a JS loop, so it costs nothing per frame and stops dead under
 * reduced motion, where it is not rendered at all.
 *
 * Lifted out of `HowItWorks` so §02's portal diagram and §09's onboarding flow
 * run literally the same animation rather than two that merely look alike.
 *
 * The gradient is `userSpaceOnUse`, so `from`/`to` are x coordinates in the
 * host SVG's own viewBox — a caller with a 96-wide connector and a caller with
 * a 720-wide diagram both work, provided `band` is scaled to suit.
 */
export function TravellingGradient({
  id,
  from,
  to,
  delay,
  cycle,
  travel = 2.2,
  band = 96,
}: {
  id: string;
  /** x where the band starts its run */
  from: number;
  /** x where it finishes */
  to: number;
  /** seconds before this line's first pulse */
  delay: number;
  /** seconds for the whole loop: travel plus the idle gap after it */
  cycle: number;
  /** seconds of actual movement */
  travel?: number;
  /** width of the bright band, in the host viewBox's units */
  band?: number;
}) {
  const start = from - band;
  const t = (travel / cycle).toFixed(4);

  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={start} y1="0" x2={from} y2="0">
      <stop offset="0" stopColor="#0040F8" stopOpacity="0" />
      <stop offset="0.45" stopColor="#0080F8" stopOpacity="0.95" />
      <stop offset="0.62" stopColor="#00E0F8" stopOpacity="1" />
      <stop offset="1" stopColor="#00E0F8" stopOpacity="0" />
      <animate
        attributeName="x1"
        values={`${start};${to};${to}`}
        keyTimes={`0;${t};1`}
        calcMode="spline"
        keySplines="0.16 1 0.3 1;0 0 1 1"
        dur={`${cycle}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
      <animate
        attributeName="x2"
        values={`${start + band};${to + band};${to + band}`}
        keyTimes={`0;${t};1`}
        calcMode="spline"
        keySplines="0.16 1 0.3 1;0 0 1 1"
        dur={`${cycle}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </linearGradient>
  );
}
