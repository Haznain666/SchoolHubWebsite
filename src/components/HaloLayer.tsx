import { useEffect, useRef, type MutableRefObject } from 'react';

import { ASSETS } from '../lib/asset';
import { DAMPING, clamp, clampDt, damp } from '../lib/damp';
import { lerp, type PointerState } from '../hooks/usePointer';
import type { HaloPreset } from '../data/sections';

/**
 * The neon halo (CHANGES-V2 §F) — what replaces the flat tinted PNG at low
 * opacity that the client called dull.
 *
 * It is a composite of four layers on one centre: a saturated core with a
 * stack of coloured drop-shadows, an inner glow, a wide outer glow and an
 * ambient aura. The floors below are enforced on every frame, so however low a
 * section's preset opacity is, it can never go dull.
 *
 * It sits *behind* the bot at all times and behind the hairlines. That is the
 * client's rule, and it is enforced here by z-index alone: this layer is z-0,
 * the 3D canvas is z-1, the scrim z-2 and the hairlines z-3.
 */

const HALO_FLOOR = {
  opacity: 0.82,
  coreIntensity: 2.8,
  innerGlow: 0.28,
  outerGlow: 0.08,
} as const;

const MAX_PARALLAX = 30; // px

/**
 * One halo: a fluorescent sparkle with its own bleed. `blur` is the soft
 * bleed behind the glyph; `opacity` dims the whole light so the far one can
 * sit behind the near one without looking like the same asset twice.
 */
function Sparkle({
  scale,
  opacity,
  blur,
  reduced,
}: {
  scale: number;
  opacity: number;
  blur: number;
  reduced: boolean;
}) {
  const glyph = `url("${ASSETS.sparkle}")`;
  const mask = {
    WebkitMaskImage: glyph,
    maskImage: glyph,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  } as const;

  return (
    <div className="absolute inset-0" style={{ opacity, transform: `scale(${scale})` }}>
      {/* the bleed — one soft layer, not the three-deep stack that smeared */}
      <span
        className="absolute left-1/2 top-1/2 block h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2"
        style={{ ...mask, background: '#00E0F8', filter: `blur(${blur}px)`, opacity: 0.55 }}
      />
      {/* the light itself — fluorescent, saturated past the source artwork */}
      <div className={`absolute inset-0 ${reduced ? '' : 'halo-pulse'}`}>
        <img
          src={ASSETS.sparkle}
          alt=""
          width={1024}
          height={1024}
          decoding="async"
          className="block h-full w-full select-none"
          style={{
            filter: [
              'saturate(2.4)',
              'brightness(1.25)',
              'drop-shadow(0 0 10px rgba(0,224,248,1))',
              'drop-shadow(0 0 30px rgba(0,224,248,.85))',
              'drop-shadow(0 0 70px rgba(0,128,248,.55))',
            ].join(' '),
          }}
        />
      </div>
    </div>
  );
}

interface Props {
  halo: HaloPreset;
  reduced: boolean;
  /** the bot's pointer state — the halo uses it with the sign flipped */
  pointer: MutableRefObject<PointerState>;
}

interface Resolved {
  x: number;
  y: number;
  d: number;
  opacity: number;
}

/**
 * `frameMode: 'contained'` keeps the whole halo on screen. `'cropped'` lets it
 * sit partly outside, and is deliberately *not* pulled back — only the
 * `minVisibleFraction` guarantee is applied, so at least that much of it stays
 * in frame.
 */
/**
 * The client asked for the halos to sit "in the distance". Depth on a flat
 * layer is read almost entirely from size, so the §D diameters are scaled
 * down here rather than edited one by one — that keeps the per-section
 * composition §D describes while pushing the whole pair further back.
 */
const DISTANCE_SCALE = 0.6;

function resolve(halo: HaloPreset, vw: number, vh: number): Resolved {
  const d = halo.d * DISTANCE_SCALE * Math.min(vw, vh);
  const r = d / 2;
  let x = halo.x * vw;
  let y = halo.y * vh;

  if (halo.frameMode === 'contained') {
    x = clamp(x, r, vw - r);
    y = clamp(y, r, vh - r);
  } else {
    const keep = (halo.minVisibleFraction ?? 0.5) * d;
    x = clamp(x, keep - r, vw - keep + r);
    y = clamp(y, keep - r, vh - keep + r);
  }

  return {
    x,
    y,
    d,
    opacity: halo.visible ? Math.max(halo.opacity, HALO_FLOOR.opacity) : 0,
  };
}

export function HaloLayer({ halo, reduced, pointer }: Props) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HaloPreset>(halo);
  haloRef.current = halo;

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;

    const vw0 = window.innerWidth;
    const vh0 = window.innerHeight;
    const first = resolve(haloRef.current, vw0, vh0);

    // live state, damped at rate 5.1 (§F) — mutated in place, never in React
    let x = first.x;
    let y = first.y;
    let d = first.d;
    let o = 0; // always fade up from nothing on first paint
    let px = 0;
    let py = 0;
    let last = 0;
    let raf = 0;

    const tick = (now: number) => {
      const dt = clampDt(last ? (now - last) / 1000 : 0);
      last = now;

      const target = resolve(haloRef.current, window.innerWidth, window.innerHeight);
      x = damp(x, target.x, DAMPING.halo, dt);
      y = damp(y, target.y, DAMPING.halo, dt);
      d = damp(d, target.d, DAMPING.halo, dt);
      o = damp(o, target.opacity, DAMPING.halo, dt);

      if (!reduced) {
        // parallax is OPPOSITE in sign to the bot's, so the depth separation
        // between the two layers is actually felt
        const p = pointer.current;
        px = lerp(px, -p.x * MAX_PARALLAX, 0.035);
        py = lerp(py, -p.y * MAX_PARALLAX, 0.035);
      }

      el.style.width = `${d.toFixed(1)}px`;
      el.style.height = `${d.toFixed(1)}px`;
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translate3d(${(x + px).toFixed(1)}px, ${(y + py).toFixed(1)}px, 0) translate(-50%, -50%)`;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pointer, reduced]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* the rAF loop owns this element's transform and nothing else writes to
          it — the spin lives one level down, or CSS would compose the rotation
          after the translation and swing the halo around the viewport corner */}
      <div
        ref={nodeRef}
        className="absolute left-0 top-0"
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        {/*
          TWO halos, fluorescent, held at a distance — the client's correction
          to the four-layer cluster that shipped before, which read as a pale
          smear crowding the bot rather than two lights sitting far behind it.

          Each halo is one sparkle glyph carrying its own neon: a saturated
          core plus stacked cyan drop-shadows, and a single soft bleed behind
          it. The second is deliberately smaller, dimmer and offset, so the
          pair reads as depth rather than as a repeat.
        */}
        <div className={`absolute inset-0 ${reduced ? '' : 'halo-spin'}`}>
          <div className={`absolute inset-0 ${reduced ? '' : 'halo-breathe'}`}>
            <Sparkle scale={1} opacity={1} blur={26} reduced={reduced} />
          </div>
        </div>
        <div
          className="absolute left-[64%] top-[22%] h-[46%] w-[46%]"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <div className={`absolute inset-0 ${reduced ? '' : 'halo-breathe-slow'}`}>
            <Sparkle scale={1} opacity={0.72} blur={18} reduced={reduced} />
          </div>
        </div>
      </div>
    </div>
  );
}
