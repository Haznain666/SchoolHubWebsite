import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useInView } from 'framer-motion';

import { useCountUp } from '../hooks/useCountUp';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/**
 * The dashboard bento (CHANGES-V2 §G.2).
 *
 * Every cell is an HTML/CSS/SVG recreation of a real School Hub panel, never a
 * screenshot — so it scales crisply, it animates, and it carries no tenant
 * data. Per §H.2 every name is Western and every figure is invented.
 *
 * Each cell carries the §5.9 card hover: pointer-tracked spotlight, lift,
 * accent border, growing leading rule — applied on `:focus-within` too, so the
 * grid is keyboard-reachable.
 */

const onMove = (e: React.MouseEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
};

function Cell({
  eyebrow,
  title,
  body,
  className = '',
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article className={`info-card flex flex-col ${className}`} onMouseMove={onMove} tabIndex={0}>
      <div className="relative flex items-center gap-3">
        <span className="card-rule" />
        <span className="card-index eyebrow text-steel-500">{eyebrow}</span>
      </div>
      <h3 className="display relative mt-2 text-[0.95rem] leading-[1.2]">{title}</h3>
      <p className="body-copy relative mt-1 text-[0.72rem] leading-snug text-steel-700">{body}</p>
      <div className="relative mt-3 min-h-0 flex-1">{children}</div>
    </article>
  );
}

/* ---- 1. Collection by campus — billed vs collected ------------------- */

const CAMPUSES = [
  { name: 'Northgate', billed: 100, collected: 82 },
  { name: 'Westbrook', billed: 78, collected: 54 },
  { name: 'Ashfield', billed: 61, collected: 49 },
];

function Collection({ on }: { on: boolean }) {
  return (
    <div className="space-y-2.5">
      {CAMPUSES.map((c, i) => (
        <div key={c.name}>
          <div className="flex items-baseline justify-between">
            <span className="body-copy text-[0.68rem] text-steel-700">{c.name}</span>
            <span className="body-copy tabular-nums text-[0.64rem] text-steel-500">
              {c.collected}% collected
            </span>
          </div>
          <span className="mt-1 block h-[5px] w-full rounded-full bg-steel-100">
            <span
              className="block h-full rounded-full bg-steel-300 origin-left"
              style={{
                transform: `scaleX(${on ? c.billed / 100 : 0})`,
                transition: `transform 900ms cubic-bezier(.22,1,.36,1) ${i * 80}ms`,
              }}
            />
          </span>
          <span className="mt-[3px] block h-[5px] w-full rounded-full bg-steel-100">
            <span
              className="block h-full origin-left rounded-full"
              style={{
                background: 'linear-gradient(90deg,#0040F8,#00E0F8)',
                transform: `scaleX(${on ? c.collected / 100 : 0})`,
                transition: `transform 900ms cubic-bezier(.22,1,.36,1) ${120 + i * 80}ms`,
              }}
            />
          </span>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-0.5">
        <span className="flex items-center gap-1.5">
          <span className="block h-[3px] w-4 rounded-full bg-steel-300" />
          <span className="body-copy text-[0.62rem] text-steel-500">Billed</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="block h-[3px] w-4 rounded-full"
            style={{ background: 'linear-gradient(90deg,#0040F8,#00E0F8)' }}
          />
          <span className="body-copy text-[0.62rem] text-steel-500">Collected</span>
        </span>
      </div>
    </div>
  );
}

/* ---- 2. Enrollment share — donut, arc draws in, centre counts up ----- */

const SHARE = [
  { label: 'Primary', value: 46, colour: '#0040F8' },
  { label: 'Middle', value: 32, colour: '#0080F8' },
  { label: 'Senior', value: 22, colour: '#00E0F8' },
];

function Enrollment({ on, reduced }: { on: boolean; reduced: boolean }) {
  const total = useCountUp(1284, on, reduced, 1500);
  const C = 2 * Math.PI * 15.9;
  let offset = 0;

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <svg viewBox="0 0 42 42" className="block h-[104px] w-[104px] -rotate-90">
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#E7EAEF" strokeWidth="4.4" />
        {SHARE.map((s, i) => {
          const len = (s.value / 100) * C;
          const dash = `${len} ${C - len}`;
          const thisOffset = -offset;
          offset += len;
          return (
            <circle
              key={s.label}
              cx="21"
              cy="21"
              r="15.9"
              fill="none"
              stroke={s.colour}
              strokeWidth="4.4"
              strokeLinecap="butt"
              strokeDasharray={dash}
              strokeDashoffset={thisOffset}
              style={{
                opacity: on ? 1 : 0,
                strokeDasharray: on ? dash : `0 ${C}`,
                transition: `stroke-dasharray 1000ms cubic-bezier(.22,1,.36,1) ${i * 140}ms, opacity 300ms linear`,
              }}
            />
          );
        })}
      </svg>
      <p className="display -mt-[68px] text-[1.35rem] tabular-nums leading-none text-ink">
        {total.toLocaleString('en-GB')}
      </p>
      <p className="eyebrow mt-1 text-[0.54rem] text-steel-500">Enrolled</p>
      <ul className="mt-[34px] w-full space-y-1">
        {SHARE.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="block h-[7px] w-[7px] shrink-0 rounded-full"
              style={{ background: s.colour }}
            />
            <span className="body-copy flex-1 text-[0.66rem] text-steel-700">{s.label}</span>
            <span className="body-copy tabular-nums text-[0.66rem] text-steel-500">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- 3. Today's register — attendance ring + ticking counts ---------- */

function Register({ on, reduced }: { on: boolean; reduced: boolean }) {
  const present = useCountUp(1207, on, reduced, 1400);
  const absent = useCountUp(51, on, reduced, 1400);
  const late = useCountUp(26, on, reduced, 1400);
  const C = 2 * Math.PI * 15.9;
  const pct = 94;

  return (
    <div className="flex h-full items-center gap-3">
      <div className="relative shrink-0">
        <svg viewBox="0 0 42 42" className="block h-[76px] w-[76px] -rotate-90">
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#E7EAEF" strokeWidth="4.2" />
          <circle
            cx="21"
            cy="21"
            r="15.9"
            fill="none"
            stroke="url(#reg-grad)"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * C} ${C}`}
            style={{
              strokeDashoffset: on ? 0 : C,
              transition: 'stroke-dashoffset 1100ms cubic-bezier(.22,1,.36,1)',
            }}
          />
          <defs>
            <linearGradient id="reg-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0040F8" />
              <stop offset="1" stopColor="#00E0F8" />
            </linearGradient>
          </defs>
        </svg>
        <span className="display absolute inset-0 flex items-center justify-center text-[0.95rem] tabular-nums text-ink">
          {pct}%
        </span>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {[
          ['Present', present],
          ['Absent', absent],
          ['Late', late],
        ].map(([label, value]) => (
          <li key={label as string} className="flex items-baseline justify-between">
            <span className="body-copy text-[0.68rem] text-steel-500">{label}</span>
            <span className="display tabular-nums text-[0.85rem] text-ink">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- 4. Vouchers — one row flips Overdue → Cleared on a loop ---------- */

const VOUCHERS = [
  { ref: 'SH-V-0412', name: 'Alex Morgan', amount: '₨ 18,400' },
  { ref: 'SH-V-0418', name: 'Emily Hart', amount: '₨ 21,750' },
  { ref: 'SH-V-0423', name: 'John Carter', amount: '₨ 18,400' },
];

function Vouchers({ reduced }: { reduced: boolean }) {
  const [cleared, setCleared] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setCleared(true);
      return;
    }
    const id = window.setInterval(() => setCleared((v) => !v), 3200);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <ul className="space-y-1.5">
      {VOUCHERS.map((v, i) => {
        const flipping = i === 2;
        const status = flipping ? (cleared ? 'Cleared' : 'Overdue') : i === 0 ? 'Cleared' : 'Due';
        return (
          <li
            key={v.ref}
            className="flex items-center gap-2 rounded-[6px] border border-steel-100 bg-paper px-2 py-1.5"
          >
            <span className="min-w-0 flex-1">
              <span className="body-copy block truncate text-[0.68rem] text-ink">{v.name}</span>
              <span className="body-copy block tabular-nums text-[0.58rem] text-steel-500">
                {v.ref}
              </span>
            </span>
            <span className="body-copy tabular-nums text-[0.64rem] text-steel-700">{v.amount}</span>
            <span
              key={status}
              className={`voucher-flag rounded-full border px-1.5 py-[1px] text-[0.55rem] ${
                status === 'Cleared'
                  ? 'border-brand-mid/35 text-brand-mid'
                  : status === 'Overdue'
                    ? 'border-accent/35 text-ink'
                    : 'border-steel-300 text-steel-500'
              }`}
            >
              {status}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---- 5. Staff KPIs — four ranked rows, bars fill on entry ------------ */

const KPI_ROWS = [
  { name: 'Sarah Whitfield', score: 94 },
  { name: 'Daniel Reed', score: 88 },
  { name: 'Mike Bennett', score: 81 },
  { name: 'Laura Finch', score: 74 },
];

function Kpis({ on }: { on: boolean }) {
  return (
    <ol className="space-y-2">
      {KPI_ROWS.map((r, i) => (
        <li key={r.name} className="flex items-center gap-2">
          <span className="eyebrow w-4 shrink-0 tabular-nums text-[0.55rem] text-steel-500">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="body-copy w-[6.4rem] shrink-0 truncate text-[0.68rem] text-steel-700">
            {r.name}
          </span>
          <span className="block h-[5px] flex-1 rounded-full bg-steel-100">
            <span
              className="block h-full origin-left rounded-full"
              style={{
                background: 'linear-gradient(90deg,#0040F8,#00E0F8)',
                transform: `scaleX(${on ? r.score / 100 : 0})`,
                transition: `transform 900ms cubic-bezier(.22,1,.36,1) ${i * 80}ms`,
              }}
            />
          </span>
          <span className="display w-6 shrink-0 text-right tabular-nums text-[0.8rem] text-ink">
            {r.score}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ---- 6. Messages — two bubbles that type themselves in on a loop ----- */

const THREAD = [
  { from: 'Emily Hart', side: 'in' as const, text: 'Is the August voucher still open?' },
  { from: 'Fee office', side: 'out' as const, text: 'Cleared this morning — receipt sent.' },
];

function useLoopedTyping(reduced: boolean): { step: number; chars: number } {
  const [state, setState] = useState({ step: reduced ? THREAD.length : 0, chars: 999 });

  useEffect(() => {
    if (reduced) {
      setState({ step: THREAD.length, chars: 999 });
      return;
    }
    let raf = 0;
    let t0 = 0;
    const SPEED = 38; // ms per character
    const HOLD = 1500; // ms between bubbles
    const REST = 2600; // ms before the thread restarts

    const durations = THREAD.map((m) => m.text.length * SPEED + HOLD);
    const total = durations.reduce((a, b) => a + b, 0) + REST;

    const tick = (now: number) => {
      if (!t0) t0 = now;
      let t = (now - t0) % total;
      let step = 0;
      let chars = 0;
      for (let i = 0; i < THREAD.length; i += 1) {
        if (t < durations[i]) {
          step = i;
          chars = Math.floor(t / SPEED);
          t = -1;
          break;
        }
        t -= durations[i];
      }
      if (t >= 0) {
        step = THREAD.length;
        chars = 999;
      }
      setState((prev) => (prev.step === step && prev.chars === chars ? prev : { step, chars }));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return state;
}

function Messages({ reduced }: { reduced: boolean }) {
  const { step, chars } = useLoopedTyping(reduced);

  return (
    <div className="space-y-2">
      {THREAD.map((m, i) => {
        const visible = i < step ? m.text : i === step ? m.text.slice(0, chars) : '';
        const shown = i <= step;
        return (
          <div key={m.from} className={m.side === 'out' ? 'flex justify-end' : 'flex'}>
            <div
              className={`max-w-[85%] rounded-[10px] px-2.5 py-1.5 ${
                m.side === 'out'
                  ? 'rounded-tr-[3px] bg-accent/[0.07]'
                  : 'rounded-tl-[3px] border border-steel-100 bg-paper'
              }`}
              style={{ opacity: shown ? 1 : 0.25, transition: 'opacity 300ms linear' }}
            >
              <p className="eyebrow text-[0.5rem] text-steel-500">{m.from}</p>
              <p className="body-copy mt-0.5 min-h-[1.1rem] text-[0.68rem] leading-snug text-steel-700">
                {visible}
                {i === step && !reduced ? (
                  <span className="caret ml-0.5 inline-block h-[0.7rem] w-[2px] translate-y-[1px] bg-accent/70" />
                ) : null}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------------- */

export function Bento() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { once: true, amount: 0.25 });
  const reduced = usePrefersReducedMotion();

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto]"
    >
      <Cell
        eyebrow="Fees"
        title="Collection by campus"
        body="Billed against collected, this month."
        className="sm:col-span-2"
      >
        <Collection on={on} />
      </Cell>

      <Cell
        eyebrow="Roll"
        title="Enrollment share"
        body="Who is on the roll, by school phase."
        className="lg:row-span-2"
      >
        <Enrollment on={on} reduced={reduced} />
      </Cell>

      <Cell eyebrow="Attendance" title="Today's register" body="Taken before the first bell.">
        <Register on={on} reduced={reduced} />
      </Cell>

      <Cell eyebrow="Billing" title="Vouchers" body="What has cleared since yesterday.">
        <Vouchers reduced={reduced} />
      </Cell>

      <Cell eyebrow="People" title="Staff KPIs" body="This month's ranked board.">
        <Kpis on={on} />
      </Cell>

      <Cell
        eyebrow="Messaging"
        title="Messages"
        body="Parents and desks, in one thread list."
        className="sm:col-span-2"
      >
        <Messages reduced={reduced} />
      </Cell>
    </div>
  );
}
