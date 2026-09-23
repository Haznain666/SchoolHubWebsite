import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** True when the visitor has asked the OS for reduced motion. Live-updating. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window === 'undefined' ? false : window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** True on coarse-pointer / touch devices (no hover, no mouse scrub). */
export function useIsTouch(): boolean {
  const [touch, setTouch] = useState<boolean>(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(hover: none)').matches,
  );

  useEffect(() => {
    const mql = window.matchMedia('(hover: none)');
    const onChange = (e: MediaQueryListEvent) => setTouch(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return touch;
}
