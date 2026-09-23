import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';

import { BotBoundary } from './bot/BotBoundary';
import { ASSETS } from '../lib/asset';
import { canRender3D } from '../lib/capabilities';
import { lerp, type PointerState } from '../hooks/usePointer';
import { apparentHeight, type ScenePreset } from '../data/sections';

/** Nothing in here — three.js, drei, the model — is in the first-paint bundle. */
const BotCanvas = lazy(() => import('./bot/BotCanvas'));

interface Props {
  preset: ScenePreset;
  reduced: boolean;
  coarsePointer: boolean;
  pointer: MutableRefObject<PointerState>;
}

const MAX_TILT_Y = 7; // deg — the fallback's cursor tilt
const MAX_TILT_X = 5; // deg

/**
 * How far the model is faded back on a phone.
 *
 * On a desktop the copy column and the bot occupy different halves of the
 * frame, so the model can run at full strength. A phone has one column and the
 * bot is directly behind the words — at full opacity the flat PNG was making
 * the body copy unreadable, which is the complaint. The model is pulled back
 * and centred in `SceneRig`; this is the rest of it.
 */
const MOBILE_OPACITY = 0.42;

/**
 * The fixed subject (CHANGES-V2 §B).
 *
 * The 3D model is the subject on every section from 00 onward. It is a lazily
 * imported chunk mounted only after first paint, behind an error boundary, and
 * the flat `schoolbot.png` is shown in roughly the same screen position until
 * it resolves — so the frame is never empty.
 *
 * The PNG is not merely a placeholder: it is the whole composition under
 * `prefers-reduced-motion`, on coarse pointers, without WebGL2, and if the
 * loader throws. In those four cases the `.glb` is never requested and the
 * three.js chunk is never imported.
 */
export function BotLayer({ preset, reduced, coarsePointer, pointer }: Props) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  const allow3D = canRender3D(reduced) && !failed;

  // the preset lives in a ref so section changes never re-render the canvas —
  // the rig reads it inside its own rAF loop
  const presetRef = useRef<ScenePreset>(preset);
  presetRef.current = preset;

  /** mount the 3D layer only after the browser has painted the page once */
  useEffect(() => {
    if (!allow3D) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMounted(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [allow3D]);

  const onError = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <>
      {/*
        The PNG is a FALLBACK ONLY — never a loading placeholder.

        It used to render underneath the canvas and fade out once the model
        resolved, so every visitor saw the flat, matte `schoolbot.png` for the
        second or two the `.glb` took to arrive. The client asked for that
        flash to go permanently: showing an inferior still of the subject
        before the real one loads is worse than showing nothing.

        So when the 3D layer is going to run, nothing is drawn until it is
        ready. The PNG still carries the four cases where the model genuinely
        never loads — reduced motion, no WebGL2, or a loader error — which is
        what it is actually for.
      */}
      {allow3D ? null : (
        <StaticBot
          preset={preset}
          reduced={reduced}
          pointer={pointer}
          hidden={false}
          interactive={!coarsePointer && !reduced}
        />
      )}

      {allow3D && mounted ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[1]"
          style={{
            opacity: ready ? (coarsePointer ? MOBILE_OPACITY : 1) : 0,
            transition: 'opacity 700ms cubic-bezier(.22,1,.36,1)',
          }}
        >
          <BotBoundary onError={onError}>
            <Suspense fallback={null}>
              <BotCanvas
                presetRef={presetRef}
                pointer={pointer}
                onReady={onReady}
                compact={coarsePointer}
              />
            </Suspense>
          </BotBoundary>
        </div>
      ) : null}
    </>
  );
}

/* -------------------------------------------------------------------------- */

interface StaticProps {
  preset: ScenePreset;
  reduced: boolean;
  pointer: MutableRefObject<PointerState>;
  hidden: boolean;
  interactive: boolean;
}

/**
 * `schoolbot.png`, placed from the same preset the camera uses so the swap to
 * the 3D model is not a jump. Height comes from the §D distance/fov through
 * `apparentHeight`, which is the identical formula the rig frames with.
 */
function StaticBot({ preset, reduced, pointer, hidden, interactive }: StaticProps) {
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tiltRef.current;
    if (!el || !interactive) return;

    let rx = 0;
    let ry = 0;
    let raf = 0;
    const tick = () => {
      const p = pointer.current;
      ry = lerp(ry, p.x * MAX_TILT_Y, 0.055);
      rx = lerp(rx, -p.y * MAX_TILT_X, 0.055);
      el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pointer, interactive]);

  // the same framing formula the rig uses, so swapping to the 3D model is not
  // a jump; x/y are an approximation of the projection rather than the real
  // thing, which is all a still needs
  const heightVh = Math.min(95, Math.max(30, apparentHeight(preset) * 100));
  const left = Math.min(104, Math.max(-4, 50 + preset.model.position[0] * 48));
  const top = 58 - preset.model.position[1] * 34;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        opacity: hidden ? 0 : 1,
        transition: 'opacity 700ms cubic-bezier(.22,1,.36,1)',
      }}
    >
      <div
        className="absolute"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          transform: `translate(-50%, -50%) rotate(${(preset.model.roll * 180) / Math.PI}deg)`,
          transition: 'left 1.1s cubic-bezier(.22,1,.36,1), top 1.1s cubic-bezier(.22,1,.36,1)',
          willChange: 'transform',
        }}
      >
        {/* soft radial aura behind the bot */}
        <span
          className={`absolute left-1/2 top-1/2 block h-[150%] w-[190%] -translate-x-1/2 -translate-y-1/2 rounded-full ${
            reduced ? '' : 'glow-pulse'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(0,128,248,.24) 0%, rgba(0,224,248,.12) 38%, rgba(0,128,248,0) 68%)',
          }}
        />
        <div
          ref={tiltRef}
          className="relative"
          style={{ transformStyle: 'preserve-3d', perspective: '900px' }}
        >
          <img
            src={ASSETS.bot}
            alt=""
            width={317}
            height={577}
            decoding="async"
            className={`block w-auto max-w-none select-none ${reduced ? '' : 'bot-float'}`}
            style={{
              height: `${heightVh}vh`,
              filter: 'drop-shadow(0 26px 40px rgba(1,17,46,.22))',
              transition: 'height 1.1s cubic-bezier(.22,1,.36,1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
