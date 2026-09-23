import { useEffect, useState } from 'react';

export interface Viewport {
  w: number;
  h: number;
}

/**
 * Viewport size, rAF-throttled. Used to turn the per-section poses (which are
 * percentages of the viewport) into pixel translations, so the fixed layers can
 * be animated with transforms only.
 */
export function useViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(() => ({
    w: typeof window === 'undefined' ? 1440 : window.innerWidth,
    h: typeof window === 'undefined' ? 900 : window.innerHeight,
  }));

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      setVp((prev) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        return prev.w === w && prev.h === h ? prev : { w, h };
      });
    };
    const onResize = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return vp;
}
