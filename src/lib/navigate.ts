import type { SectionId } from '../data/sections';

/**
 * A tiny registry so the fixed chrome (rail, header, overlay menu, footer) can
 * navigate without every one of them having the scroll machine threaded
 * through it as a prop. `useSectionScroll` registers itself on mount; before
 * that — and if it ever unmounts — these fall back to a plain anchor jump, so
 * the links are never dead.
 */

type Go = (id: SectionId) => void;
type Lock = (locked: boolean) => void;

let go: Go | null = null;
let lock: Lock | null = null;

export function registerNavigation(nextGo: Go, nextLock: Lock): () => void {
  go = nextGo;
  lock = nextLock;
  return () => {
    if (go === nextGo) go = null;
    if (lock === nextLock) lock = null;
  };
}

export function scrollToSection(id: string): void {
  if (go) {
    go(id as SectionId);
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
}

export function setScrollLocked(locked: boolean): void {
  lock?.(locked);
}
