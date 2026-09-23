import { Children, useCallback, type ReactNode } from 'react';

interface Props {
  index: number;
  title: string;
  body: string;
  children?: ReactNode;
}

/**
 * The infographic card hover from the inspiration (BRIEF §5.9): pointer-tracked
 * spotlight, border → accent/35, lift, shadow, leading rule w-4 → w-12 and the
 * index number fading up. The same treatment on `:focus-within`, so it is fully
 * keyboard-reachable. All of the styling lives in `.info-card` in index.css.
 */
export function InfoCard({ index, title, body, children }: Props) {
  const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <article className="info-card group h-full" onMouseMove={onMove} tabIndex={0}>
      <div className="relative flex items-center gap-3">
        <span className="card-rule" />
        <span className="card-index eyebrow tabular-nums text-steel-500">
          {String(index).padStart(2, '0')}
        </span>
      </div>
      <h3 className="display relative mt-3 text-[1.05rem] leading-[1.2]">{title}</h3>
      <p className="body-copy relative mt-2 text-[0.875rem] text-steel-700 sm:text-[0.82rem]">{body}</p>
      {children}
    </article>
  );
}

/**
 * Per-card drift period and phase, in seconds.
 *
 * Taken straight from `IsoPlane`'s `CARDS` table, and for the same reason: the
 * periods are mutually prime-ish and the phases are all different, so the six
 * cards never fall into step. A single shared duration would have the whole
 * grid breathing in unison, which reads as a glitch rather than as life.
 */
const DRIFT: readonly { period: number; phase: number }[] = [
  { period: 12.5, phase: -0.0 },
  { period: 10.5, phase: -2.1 },
  { period: 13.0, phase: -4.4 },
  { period: 11.0, phase: -1.3 },
  { period: 9.4, phase: -3.7 },
  { period: 12.0, phase: -5.9 },
];

/**
 * The two-column grid the feature scenes use.
 *
 * Each card sits on its own `.card-drift` wrapper so the grid has the same
 * continuous float as the §09 platform artwork — the cards never settle, which
 * is the whole point: a one-shot entrance is invisible to anyone who arrives
 * after it has played.
 *
 * The gap is 14px rather than the old 10px to give that drift room; see the
 * `.card-drift` note in index.css.
 *
 * `InfoCard` is used bare on §09 and §11 too, so keeping the motion here leaves
 * those grids untouched.
 */
export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {Children.map(children, (child, i) => {
        const { period, phase } = DRIFT[i % DRIFT.length];
        return (
          <div
            className="card-drift"
            style={{ animationDuration: `${period}s`, animationDelay: `${phase}s` }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
