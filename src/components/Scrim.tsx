import type { Align } from '../data/sections';

/**
 * The scrim (CHANGES-V2 §D.6).
 *
 * Build 1 washed the whole viewport, which is why the client said the bot
 * looked faded. This applies the light gradient **only behind the copy
 * column**, mirrored for right-aligned sections and softened to a vertical
 * wash for the one centred scene, so the bot reads as a solid metal object
 * everywhere else. The copy keeps its light text-shadow (`.chrome-legible`)
 * for the places where the gradient has already thinned out.
 *
 * Three fixed layers rather than one animated background, because
 * cross-fading opacity is cheap and interpolating a gradient is not.
 */
export function Scrim({ align }: { align: Align }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[2]">
      <div className="scrim scrim-start" style={{ opacity: align === 'start' ? 1 : 0 }} />
      <div className="scrim scrim-end" style={{ opacity: align === 'end' ? 1 : 0 }} />
      <div className="scrim scrim-center" style={{ opacity: align === 'center' ? 1 : 0 }} />
    </div>
  );
}
