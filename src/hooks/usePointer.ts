import { useEffect, useRef, type MutableRefObject } from 'react';

export interface PointerState {
  /** -1 (left edge) … 1 (right edge) */
  x: number;
  /** -1 (top) … 1 (bottom) */
  y: number;
}

/**
 * Normalised pointer position in a ref — deliberately NOT state, so moving the
 * mouse never re-renders React. Consumers read `ref.current` inside their own
 * rAF loop and lerp towards it.
 */
export function usePointer(enabled = true): MutableRefObject<PointerState> {
  const ref = useRef<PointerState>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      ref.current.x = 0;
      ref.current.y = 0;
      return;
    }
    const onMove = (e: PointerEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled]);

  return ref;
}

export const lerp = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount;
