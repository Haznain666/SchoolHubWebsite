import type { ReactNode } from 'react';

/**
 * The "Work that works" treatment (CHANGES-V2 §G.1).
 *
 * Nine simplified School Hub screens laid out on one shared isometric plane
 * whose origin sits outside the viewport, off the top-left corner, so the
 * nearest cards are cropped by the top and left edges. The whole plane is not
 * meant to fit on screen and is deliberately not fitted.
 *
 * Depth is carried by blur and opacity — the furthest tier is barely there,
 * the nearest is sharp — and each card drifts on its own period and phase, so
 * the plane breathes rather than sliding as one slab.
 */

interface CardSpec {
  /** column / row on the plane grid */
  col: number;
  row: number;
  /** 0 furthest, 2 nearest */
  tier: 0 | 1 | 2;
  /** seconds — every card gets its own so the plane never pulses in unison */
  period: number;
  phase: number;
  content: ReactNode;
}

const TIER = [
  { blur: 7, opacity: 0.35 },
  { blur: 3, opacity: 0.6 },
  { blur: 0, opacity: 0.95 },
] as const;

const CARD_W = 230;
const CARD_H = 158;
const GAP_X = 268;
const GAP_Y = 196;

/* ---- the miniature screens ------------------------------------------- */

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[10px] border border-steel-100 bg-paper-2 shadow-[0_22px_48px_-26px_rgba(1,17,46,.4)]">
      <div className="flex items-center gap-1.5 border-b border-steel-100 px-2.5 py-1.5">
        <span
          className="block h-2.5 w-2.5 rounded-[3px]"
          style={{ background: 'linear-gradient(160deg,#00E0F8,#0040F8)' }}
        />
        <span style={{ fontSize: 7.5 }} className="font-medium text-ink">
          {title}
        </span>
      </div>
      <div className="min-h-0 flex-1 p-2.5">{children}</div>
    </div>
  );
}

const Line = ({ w, tone = 'steel' }: { w: string; tone?: 'steel' | 'ink' | 'brand' }) => (
  <span
    className="block h-[3px] rounded-full"
    style={{
      width: w,
      background:
        tone === 'ink'
          ? 'var(--ink)'
          : tone === 'brand'
            ? 'linear-gradient(90deg,#0040F8,#00E0F8)'
            : 'var(--steel-100)',
    }}
  />
);

function Voucher() {
  return (
    <Shell title="Voucher">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Line w="54px" tone="ink" />
          <Line w="38px" />
        </div>
        <span
          className="rounded-full px-1.5 py-[1px] text-white"
          style={{ fontSize: 6, background: 'var(--ink)' }}
        >
          AUG
        </span>
      </div>
      <div className="mt-2.5 space-y-1.5">
        {[74, 58, 66, 44].map((w, i) => (
          <div key={i} className="flex items-center justify-between">
            <Line w={`${w}px`} />
            <Line w="26px" />
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-steel-100 pt-1.5">
        <Line w="30px" />
        <span style={{ fontSize: 9 }} className="display tabular-nums text-ink">
          ₨ 18,400
        </span>
      </div>
    </Shell>
  );
}


function Timetable() {
  return (
    <Shell title="Timetable">
      <div className="grid h-full grid-cols-5 grid-rows-4 gap-[3px]">
        {Array.from({ length: 20 }).map((_, i) => {
          const filled = [1, 3, 6, 7, 9, 12, 13, 16, 18].includes(i);
          return (
            <span
              key={i}
              className="block rounded-[2px]"
              style={{
                background: filled ? 'rgba(0,64,248,.16)' : 'var(--paper)',
                border: '1px solid var(--steel-100)',
              }}
            />
          );
        })}
      </div>
    </Shell>
  );
}

function KpiBoard() {
  return (
    <Shell title="Staff KPIs">
      <div className="space-y-[7px]">
        {[92, 84, 76, 63].map((v, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="block h-[9px] w-[9px] shrink-0 rounded-full"
              style={{ background: 'linear-gradient(160deg,#0080F8,#0040F8)' }}
            />
            <Line w="42px" />
            <span className="h-[4px] flex-1 rounded-full bg-steel-100">
              <span
                className="block h-full rounded-full"
                style={{ width: `${v}%`, background: 'linear-gradient(90deg,#0040F8,#00E0F8)' }}
              />
            </span>
            <span style={{ fontSize: 7 }} className="tabular-nums text-ink">
              {v}
            </span>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function Chat() {
  return (
    <Shell title="Messages">
      <div className="space-y-1.5">
        <span className="block w-[70%] rounded-[6px] rounded-tl-[2px] bg-paper p-1.5">
          <Line w="58px" />
          <span className="mt-1 block" />
          <Line w="40px" />
        </span>
        <span
          className="ml-auto block w-[64%] rounded-[6px] rounded-tr-[2px] p-1.5"
          style={{ background: 'rgba(0,64,248,.10)' }}
        >
          <Line w="46px" tone="brand" />
          <span className="mt-1 block" />
          <Line w="34px" />
        </span>
        <span className="block w-[52%] rounded-[6px] rounded-tl-[2px] bg-paper p-1.5">
          <Line w="36px" />
        </span>
      </div>
    </Shell>
  );
}



function Enrollment() {
  return (
    <Shell title="Enrollment">
      <svg viewBox="0 0 42 42" className="mx-auto block h-[74px] w-[74px]">
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#E7EAEF" strokeWidth="5" />
        <circle
          cx="21"
          cy="21"
          r="15.9"
          fill="none"
          stroke="#0040F8"
          strokeWidth="5"
          strokeDasharray="44 100"
          strokeDashoffset="25"
        />
        <circle
          cx="21"
          cy="21"
          r="15.9"
          fill="none"
          stroke="#00E0F8"
          strokeWidth="5"
          strokeDasharray="24 100"
          strokeDashoffset="-19"
        />
        <text
          x="21"
          y="22.6"
          textAnchor="middle"
          style={{ fontSize: 6, fill: '#01112E', fontWeight: 600 }}
        >
          1,284
        </text>
      </svg>
    </Shell>
  );
}

/* ---- the three charts that own the near row -------------------------- */

function AttendanceTrend() {
  return (
    <Shell title="Attendance">
      <svg viewBox="0 0 100 52" className="h-full w-full">
        <defs>
          <linearGradient id="iso-attendance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00E0F8" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#0040F8" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path
          d="M0 38 L14 33 L28 35 L42 23 L56 27 L70 14 L84 18 L100 8 L100 52 L0 52 Z"
          fill="url(#iso-attendance)"
        />
        <path
          d="M0 38 L14 33 L28 35 L42 23 L56 27 L70 14 L84 18 L100 8"
          fill="none"
          stroke="#0040F8"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx="100" cy="8" r="2.6" fill="#00E0F8" />
      </svg>
    </Shell>
  );
}

function ResultsSpread() {
  // two series, so it cannot be mistaken for `AgedDebt`'s single row of columns
  const now = [46, 62, 54, 78, 68, 84];
  const was = [38, 44, 49, 57, 61, 63];
  return (
    <Shell title="Results">
      <div className="flex h-full items-end gap-[5px] pb-1">
        {now.map((h, i) => (
          // `h-full` is what makes the bars visible at all: their heights are
          // percentages, and a percentage height needs a parent with a
          // DEFINITE height to resolve against. Without it this wrapper sized
          // itself to its content, the content sized itself to the wrapper,
          // and both collapsed to zero — the card rendered as an empty shell.
          // `AgedDebt` gets away without one only because its bars are direct
          // children of the `h-full` container.
          <span key={i} className="flex h-full flex-1 items-end gap-[2px]">
            <span
              className="block flex-1 rounded-t-[2px]"
              style={{ height: `${h}%`, background: 'linear-gradient(180deg,#00E0F8,#0040F8)' }}
            />
            <span
              className="block flex-1 rounded-t-[2px]"
              style={{ height: `${was[i]}%`, background: 'var(--steel-100)' }}
            />
          </span>
        ))}
      </div>
    </Shell>
  );
}

function FeeCollection() {
  return (
    <Shell title="Fee collection">
      <div className="flex h-full flex-col justify-center gap-2">
        <div className="flex items-baseline gap-1">
          <span style={{ fontSize: 15 }} className="font-semibold tabular-nums text-ink">
            86%
          </span>
          <span style={{ fontSize: 6.5 }} className="text-steel-500">
            collected this term
          </span>
        </div>
        <span className="block h-[6px] w-full overflow-hidden rounded-full bg-steel-100">
          <span
            className="block h-full rounded-full"
            style={{ width: '86%', background: 'linear-gradient(90deg,#00E0F8,#0040F8)' }}
          />
        </span>
        <div className="flex gap-2">
          {[
            ['Paid', '#0040F8'],
            ['Due', 'var(--steel-300)'],
            ['Waived', 'var(--steel-100)'],
          ].map(([label, tone]) => (
            <span key={label} className="flex items-center gap-1">
              <span className="block h-[5px] w-[5px] rounded-full" style={{ background: tone }} />
              <span style={{ fontSize: 6 }} className="text-steel-500">
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function AgedDebt() {
  return (
    <Shell title="Aged debt">
      <div className="flex h-full items-end gap-[6px] pb-1">
        {[34, 58, 42, 78, 50, 66].map((h, i) => (
          <span
            key={i}
            className="block flex-1 rounded-t-[2px]"
            style={{
              height: `${h}%`,
              background: i === 3 ? 'linear-gradient(180deg,#00E0F8,#0040F8)' : 'var(--steel-100)',
            }}
          />
        ))}
      </div>
    </Shell>
  );
}

/**
 * Nine cards, back to a clean 3x3.
 *
 * The three charts take the whole near row, where the tier is sharp and
 * unblurred — they are the point of this corner, so they should be the
 * legible ones. The list screens fall back into the two hazier rows, which is
 * also where they read best: a blurred bar chart is still obviously a bar
 * chart, a blurred table is just grey lines.
 *
 * Adding rows 3 and 4 to fill the lower wedge is what made this ragged at
 * eleven cards. The wedge is now covered by the near row instead.
 */
const CARDS: CardSpec[] = [
  { col: 0, row: 0, tier: 0, period: 12.5, phase: -0.0, content: <Timetable /> },
  { col: 1, row: 0, tier: 0, period: 10.5, phase: -2.1, content: <Enrollment /> },
  { col: 2, row: 0, tier: 0, period: 13.0, phase: -4.4, content: <AgedDebt /> },
  { col: 0, row: 1, tier: 1, period: 11.0, phase: -1.3, content: <Voucher /> },
  { col: 1, row: 1, tier: 1, period: 9.4, phase: -3.7, content: <KpiBoard /> },
  { col: 2, row: 1, tier: 1, period: 12.0, phase: -5.9, content: <Chat /> },
  { col: 0, row: 2, tier: 2, period: 9.8, phase: -0.8, content: <AttendanceTrend /> },
  { col: 1, row: 2, tier: 2, period: 11.6, phase: -6.2, content: <FeeCollection /> },
  { col: 2, row: 2, tier: 2, period: 10.2, phase: -3.1, content: <ResultsSpread /> },
];

export function IsoPlane() {
  return (
    <div aria-hidden="true" className="iso-wrap">
      <div className="iso-plane">
        {CARDS.map((card, i) => {
          const tier = TIER[card.tier];
          return (
            <div
              key={i}
              className="iso-card"
              style={{
                left: card.col * GAP_X,
                top: card.row * GAP_Y,
                width: CARD_W,
                height: CARD_H,
                filter: tier.blur ? `blur(${tier.blur}px)` : undefined,
                opacity: tier.opacity,
                animationDuration: `${card.period}s`,
                animationDelay: `${card.phase}s`,
              }}
            >
              {card.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
