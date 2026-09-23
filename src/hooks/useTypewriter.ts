import { useEffect, useState } from 'react';

/**
 * Sequential character reveal for the hero sub-heading (BRIEF §5.8).
 * Returns how many characters are currently visible. Under reduced motion the
 * whole string is revealed instantly.
 */
export function useTypewriter(
  total: number,
  reduced: boolean,
  { delay = 900, speed = 32 }: { delay?: number; speed?: number } = {},
): { revealed: number; done: boolean } {
  const [revealed, setRevealed] = useState(reduced ? total : 0);

  useEffect(() => {
    if (reduced) {
      setRevealed(total);
      return;
    }
    setRevealed(0);
    let raf = 0;
    let startAt = 0;

    const tick = (now: number) => {
      if (!startAt) startAt = now + delay;
      const elapsed = now - startAt;
      if (elapsed >= 0) {
        const n = Math.min(total, Math.floor(elapsed / speed) + 1);
        setRevealed(n);
        if (n >= total) {
          raf = 0;
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [total, reduced, delay, speed]);

  return { revealed, done: revealed >= total };
}
