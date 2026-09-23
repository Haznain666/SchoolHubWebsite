import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { inView, rise, stagger } from '../lib/motion';
import type { SectionMeta } from '../data/sections';

const WIDTH: Record<SectionMeta['width'], string> = {
  narrow: 'max-w-[32rem]',
  mid: 'max-w-[36rem]',
  wide: 'max-w-[46rem]',
  full: 'max-w-[72rem]',
};

const ALIGN: Record<SectionMeta['align'], string> = {
  start: 'md:justify-start',
  end: 'md:justify-end',
  center: 'md:justify-center',
};

/**
 * Shared scene shell. The large left padding from `lg` up is what keeps every
 * scene clear of the fixed "On this page" rail; the right padding keeps
 * right-aligned scenes clear of the keyboard legend. Defined once so the scenes
 * can never drift apart.
 */
export const SCENE_SHELL =
  'relative z-10 flex min-h-[100svh] items-start justify-start px-6 pb-16 pt-28 ' +
  'md:items-center md:px-12 md:pt-16 lg:pl-[13.5rem] lg:pr-[14rem] xl:pl-[15.5rem] xl:pr-[15rem]';

interface SceneProps {
  meta: SectionMeta;
  children: ReactNode;
  /** extra classes on the <section> */
  className?: string;
}

/**
 * One full-viewport scene. Sections alternate justify-start / justify-end so
 * the fixed 3D subject always gets the opposite half of the screen, exactly as
 * the "copy side" column of the CHANGES-V2 §D table specifies.
 */
export function Scene({ meta, children, className = '' }: SceneProps) {
  return (
    <section
      id={meta.id}
      aria-labelledby={`${meta.id}-heading`}
      data-align={meta.align}
      /* `scene-<id>` is a stable per-section hook for the few places a single
         scene needs its own padding — see the void-closing block in
         index.css. Generated here so it can never drift from the id. */
      className={`${SCENE_SHELL} scene-${meta.id} ${ALIGN[meta.align]} ${className}`}
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className={`relative w-full ${WIDTH[meta.width]}`}
      >
        {children}
      </motion.div>
    </section>
  );
}

/** A staggered child of a scene: opacity 0 / y 42px → settled. */
export function SceneItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={rise} className={className}>
      {children}
    </motion.div>
  );
}

/** `03  Students` — the two-digit tabular number plus the eyebrow label. */
export function Eyebrow({ num, label }: { num: string; label: string }) {
  return (
    <p className="eyebrow chrome-legible mb-5 text-accent">
      <span className="mr-3 tabular-nums opacity-70">{num}</span>
      {label}
    </p>
  );
}

export function SceneHeading({
  id,
  children,
  className = '',
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 id={id} className={`display scene-heading chrome-legible ${className}`}>
      {children}
    </h2>
  );
}

export function SceneLead({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`body-copy chrome-legible mt-5 max-w-[34rem] text-[0.95rem] text-steel-700 sm:text-[0.92rem] ${className}`}
    >
      {children}
    </p>
  );
}
