import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';

import { registerNavigation } from '../lib/navigate';
import type { SectionId } from '../data/sections';

/**
 * One scroll, one section (CHANGES-V2 §E).
 *
 * The document is never scrolled by the browser on a pointer device:
 * `preventDefault()` is called on every wheel event and this state machine
 * decides what happens. The thresholds below were read out of the inspiration
 * site's shipped bundle and are used as-is.
 *
 * The rule that actually does the work is §E.3: the machine re-arms only after
 * `REARM_GAP_MS` of complete wheel silence. A continuous flick — however
 * violent, however many events it fires — therefore moves exactly one section
 * and no more.
 */

const THRESHOLD_WHEEL = 35; // mouse wheel (deltaMode !== 0, or |delta| >= 50)
const THRESHOLD_TRACKPAD = 70; // fine-grained deltas
const REARM_GAP_MS = 140; // silence required before a new gesture counts
const GESTURE_FLOOR_MS = 160; // minimum spacing between section changes
const SETTLE_MS = 40; // cooldown after the scroll lands
// The client's note was that the scroll "lags". 0.5s of travel plus an 80ms
// settle plus the 140ms re-arm gap put ~720ms between a flick and the next
// one being possible, which reads as unresponsive. 0.34s still reads as a
// move rather than a cut, and takes the floor under half a second.
const SCROLL_DURATION = 0.34; // seconds
const SCROLL_DURATION_REDUCED = 0.25;

/** Most stops one section may contribute. No real section comes near this. */
const MAX_SUB_STEPS = 40;

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface Step {
  sectionIndex: number;
  offset: number;
}

export interface SectionScroll {
  activeIndex: number;
  next: () => void;
  prev: () => void;
  goTo: (id: SectionId) => void;
  /** Lenis is paused while the mobile overlay menu owns the screen */
  setLocked: (locked: boolean) => void;
}

/**
 * Walk up from the wheel's target looking for an inner scrollable panel that
 * can still move in this direction (§E.8). If there is one, the event is left
 * alone so the panel keeps working.
 */
function insideLiveScrollScope(target: EventTarget | null, deltaY: number): boolean {
  let node = target instanceof Element ? target : null;
  while (node) {
    if (node.hasAttribute('data-scroll-scope')) {
      const max = node.scrollHeight - node.clientHeight;
      if (max > 1) {
        if (deltaY < 0 && node.scrollTop > 0) return true;
        if (deltaY > 0 && node.scrollTop < max - 1) return true;
      }
    }
    node = node.parentElement;
  }
  return false;
}

export function useSectionScroll(
  ids: readonly SectionId[],
  reduced: boolean,
  coarsePointer: boolean,
): SectionScroll {
  const [activeIndex, setActiveIndex] = useState(0);

  const lenisRef = useRef<Lenis | null>(null);
  const stepsRef = useRef<Step[]>([]);
  const stepIndexRef = useRef(0);
  const lockedUntilRef = useRef(0);
  const durationRef = useRef(reduced ? SCROLL_DURATION_REDUCED : SCROLL_DURATION);
  durationRef.current = reduced ? SCROLL_DURATION_REDUCED : SCROLL_DURATION;

  /* ---- the flat list of scroll stops, one per sub-step (§E.7) --------- */
  const measure = useCallback(() => {
    const vh = window.innerHeight;

    // A hidden, collapsed or not-yet-laid-out viewport reports innerHeight 0,
    // and that used to be fatal: `subSteps` below divides by `vh * 0.8`, so at
    // zero height it evaluated to Infinity and the loop pushed into `steps`
    // until the array blew its maximum length. The resulting
    // `RangeError: Invalid array length` is thrown from inside a passive
    // effect, so React unmounts the whole tree — a blank white page with a
    // stack that points at react-dom rather than at here.
    //
    // There is nothing meaningful to measure at zero height. Bail and keep the
    // previous steps; `scrollToStep` already no-ops on an empty list, and the
    // resize / orientationchange / body-ResizeObserver listeners below re-run
    // this the moment the viewport is real, so it is self-healing.
    if (vh <= 0) return;

    const steps: Step[] = [];
    ids.forEach((id, sectionIndex) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const height = el.offsetHeight;
      // capped as a second line of defence: a pathological height cannot turn
      // this into a runaway loop again
      const subSteps =
        height > vh ? Math.min(1 + Math.ceil((height - vh) / (vh * 0.8)), MAX_SUB_STEPS) : 1;
      const maxOffset = top + Math.max(0, height - vh);
      for (let i = 0; i < subSteps; i += 1) {
        steps.push({ sectionIndex, offset: Math.min(top + i * vh * 0.8, maxOffset) });
      }
    });
    stepsRef.current = steps;
  }, [ids]);

  /** Nearest stop to the current scroll position. */
  const syncFromScroll = useCallback(() => {
    // Not while a programmatic scroll is in flight.
    //
    // `scrollToStep` has already published the destination index. This runs on
    // every frame of the 0.34s Lenis animation, and for the first half of that
    // travel the *nearest* stop is still the one being left — so the active
    // index went destination -> origin -> destination inside 340ms, which the
    // scene rig renders as the bot setting off, stopping dead, and then
    // setting off again. A nav-bar jump across several sections was worse: the
    // sweep dragged the index through every stop in between, so the bot tried
    // to strike each intervening pose on the way past.
    //
    // `lockedUntilRef` already marks exactly that window (travel + settle),
    // and it is the same gate the wheel machine uses to ignore input.
    if (performance.now() < lockedUntilRef.current) return;

    const steps = stepsRef.current;
    if (!steps.length) return;
    const y = window.scrollY;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < steps.length; i += 1) {
      const dist = Math.abs(steps[i].offset - y);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    // the footer can be shorter than a viewport, so the document bottom always
    // resolves to the last stop
    const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 2;
    if (atBottom) best = steps.length - 1;
    stepIndexRef.current = best;
    const next = steps[best].sectionIndex;
    setActiveIndex((prev) => (prev === next ? prev : next));
  }, []);

  const scrollToStep = useCallback(
    (index: number) => {
      const steps = stepsRef.current;
      if (!steps.length) return;
      const clamped = Math.max(0, Math.min(steps.length - 1, index));
      stepIndexRef.current = clamped;
      setActiveIndex(steps[clamped].sectionIndex);

      const offset = steps[clamped].offset;
      const duration = durationRef.current;
      lockedUntilRef.current = performance.now() + duration * 1000 + SETTLE_MS;

      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(offset, {
          duration,
          easing: easeInOutCubic,
          lock: true,
          force: true,
        });
      } else {
        window.scrollTo({ top: offset, behavior: reduced ? 'auto' : 'smooth' });
      }
    },
    [reduced],
  );

  const next = useCallback(() => scrollToStep(stepIndexRef.current + 1), [scrollToStep]);
  const prev = useCallback(() => scrollToStep(stepIndexRef.current - 1), [scrollToStep]);

  const goTo = useCallback(
    (id: SectionId) => {
      const sectionIndex = ids.indexOf(id);
      if (sectionIndex < 0) return;
      const at = stepsRef.current.findIndex((s) => s.sectionIndex === sectionIndex);
      if (at >= 0) scrollToStep(at);
    },
    [ids, scrollToStep],
  );

  const setLocked = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  }, []);

  /* ---- Lenis: only the animated scrollTo engine (§E.6) ---------------- */
  useEffect(() => {
    const instance = new Lenis({
      lerp: 0.09,
      // the wheel is fully intercepted below, so Lenis must not also smooth it
      smoothWheel: false,
      syncTouch: false,
    });
    lenisRef.current = instance;

    let raf = 0;
    const tick = (time: number) => {
      instance.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* ---- measurement + position tracking -------------------------------- */
  useEffect(() => {
    measure();
    syncFromScroll();

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        syncFromScroll();
      });
    };
    const onResize = () => {
      measure();
      syncFromScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });

    // sections grow as fonts and images land; re-measure when the body does
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);

    const settle = window.setTimeout(onResize, 600);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [measure, syncFromScroll]);

  /* ---- the wheel state machine (§E.1–E.5) ----------------------------- */
  useEffect(() => {
    // touch devices keep native scrolling: nothing is intercepted (§E.9)
    if (coarsePointer) return;

    let armed = true;
    let accumulator = 0;
    let lastWheelAt = 0;
    let lastMoveAt = 0;

    const onWheel = (e: WheelEvent) => {
      if (insideLiveScrollScope(e.target, e.deltaY)) return;
      e.preventDefault();

      // §E.1 — normalise across delta modes
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= window.innerHeight;

      const now = performance.now();

      // §E.3 — re-arm only after a full gap of silence. While a flick is still
      // firing events this never becomes true, so it can only move one section.
      if (now - lastWheelAt > REARM_GAP_MS) {
        accumulator = 0;
        armed = true;
      }
      lastWheelAt = now;

      if (!armed) return;
      if (now < lockedUntilRef.current) return; // §E.4 — settle cooldown
      if (now - lastMoveAt < GESTURE_FLOOR_MS) return; // §E.4 — gesture floor

      const coarseWheel = e.deltaMode !== 0 || Math.abs(dy) >= 50;
      const threshold = coarseWheel ? THRESHOLD_WHEEL : THRESHOLD_TRACKPAD;

      accumulator += dy;
      if (Math.abs(accumulator) < threshold) return;

      const direction = accumulator > 0 ? 1 : -1;
      accumulator = 0;
      armed = false;
      lastMoveAt = now;
      scrollToStep(stepIndexRef.current + direction);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [coarsePointer, scrollToStep]);

  /* ---- let the fixed chrome navigate without prop drilling ------------ */
  useEffect(() => registerNavigation(goTo, setLocked), [goTo, setLocked]);

  return useMemo(
    () => ({ activeIndex, next, prev, goTo, setLocked }),
    [activeIndex, next, prev, goTo, setLocked],
  );
}
