import { useEffect, useState } from 'react';

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts a figure up when its card enters view. Reduced motion returns the
 * final value immediately. The rAF loop is always cancelled on unmount.
 */
export function useCountUp(target: number, start: boolean, reduced: boolean, ms = 1400): number {
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    if (!start) return;

    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const p = Math.min((now - t0) / ms, 1);
      setValue(Math.round(easeOut(p) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
      else raf = 0;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, start, reduced, ms]);

  return value;
}
