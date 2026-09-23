import type { Variants } from 'framer-motion';

/** The inspiration's easing, used for every scene transition. */
export const EASE_SCENE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Stagger ~60ms between a scene's children (BRIEF §5.1). */
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** opacity 0 / translateY(42px) → settled, 700ms. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 42 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_SCENE },
  },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: EASE_SCENE } },
};

/** Shared viewport config so every scene triggers at the same point. */
export const inView = { once: true, amount: 0.2 } as const;
