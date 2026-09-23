import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { useCountUp } from '../hooks/useCountUp';
import type { Stat } from '../data/content';

interface Props extends Stat {
  index: number;
  reduced: boolean;
}

/**
 * A proof stat that counts its figure up on entry (tabular-nums, reduced-motion
 * honoured) and carries the §5.9 card hover.
 */
export function StatCard({ label, figure, caption, index, reduced }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const value = useCountUp(figure, inView, reduced, 1300 + index * 120);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <div ref={ref} className="info-card" onMouseMove={onMove} tabIndex={0}>
      <div className="relative flex items-center gap-3">
        <span className="card-rule" />
        <span className="card-index eyebrow tabular-nums text-steel-500">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <p className="eyebrow relative mt-3 text-steel-500">{label}</p>
      <p className="display relative mt-1 text-[2.6rem] leading-none tabular-nums text-ink">
        {value}
      </p>
      <p className="body-copy relative mt-2 text-[0.78rem] text-steel-700">{caption}</p>
      <span
        className="relative mt-3 block h-px w-full overflow-hidden bg-steel-100"
        aria-hidden="true"
      >
        <span
          className="bar-grow block h-full"
          style={{
            width: `${Math.min(100, (figure / 51) * 100 + 18)}%`,
            background: 'linear-gradient(90deg,var(--brand-blue),var(--brand-cyan))',
            animationDelay: `${index * 0.1}s`,
          }}
        />
      </span>
    </div>
  );
}
