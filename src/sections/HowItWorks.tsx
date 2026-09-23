import { useId, useState } from 'react';

import { Eyebrow, Scene, SceneHeading, SceneItem, SceneLead } from '../components/Scene';
import { TravellingGradient } from '../components/TravellingGradient';
import { ASSETS } from '../lib/asset';
import { howItWorks } from '../data/content';
import { sectionById } from '../data/sections';

const meta = sectionById('how-it-works');

/* --------------------------------------------------------------------------
   Geometry. One co-ordinate system for the nodes and the curves so the paths
   always land exactly on the node edges, whatever the viewBox scales to.
   -------------------------------------------------------------------------- */

/* `TEACHING` and `PLATFORM` are the widest labels; at 10px with 0.24em
   tracking they run ~78px to the LEFT of their node. The old SRC_X of 78 left
   only 47px before the viewBox edge, so the SVG clipped them to "CHING" and
   "TFORM". SRC_X now reserves the full run. */
const VB = { w: 720, h: 300 };
const SRC_X = 158;
const SRC_Y = [42, 110, 186, 258];
const HUB = { x: 404, y: 150, r: 40 };
const OUT = { x: 650, y: 150, r: 20 };
const NODE_R = 17;

/** Stagger, so the four pulses arrive at the hub at different times (§I). */
const DELAYS = [0, 0.9, 1.75, 2.6];
const CYCLE = 4.6; // s — travel plus the idle gap before the next pulse
const CYCLE_HOT = 2.1; // s — on hover the pulse speeds up

const sourcePath = (y: number): string =>
  `M ${SRC_X + NODE_R} ${y} C ${SRC_X + 120} ${y}, ${HUB.x - 130} ${HUB.y}, ${HUB.x - HUB.r} ${HUB.y}`;

const OUT_PATH = `M ${HUB.x + HUB.r} ${HUB.y} C ${HUB.x + 90} ${HUB.y}, ${OUT.x - 90} ${OUT.y}, ${OUT.x - OUT.r} ${OUT.y}`;

/**
 * Source -> hub -> output as ONE path with two subpaths.
 *
 * Previously the outbound leg had a single gradient of its own on a fixed
 * delay, so it read as one pulse leaving the hub rather than as each portal's
 * own pulse carrying through — only one of the four ever appeared to reach
 * "Your school". Now every source owns the whole journey: one gradient spans
 * `SRC_X -> OUT.x`, lighting the inbound leg, dimming across the hub, then
 * lighting the outbound leg.
 */
const fullPath = (y: number): string => `${sourcePath(y)} ${OUT_PATH}`;

function NodeGlyph({ kind }: { kind: string }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (kind) {
    case 'office':
      return (
        <g {...common}>
          <path d="M-6 6v-10h12v10" />
          <path d="M-3 -1h2M2 -1h2M-3 2.5h2M2 2.5h2" />
        </g>
      );
    case 'teaching':
      return (
        <g {...common}>
          <path d="M-7 -3.5 0 -7l7 3.5L0 0z" />
          <path d="M-4 -2v4.5c0 1.6 8 1.6 8 0V-2" />
        </g>
      );
    case 'family':
      return (
        <g {...common}>
          <circle cx="-2.5" cy="-3" r="2.6" />
          <path d="M-7.5 6c0-3 2.2-4.6 5-4.6s5 1.6 5 4.6" />
          <circle cx="4.6" cy="-1.6" r="1.9" />
        </g>
      );
    default:
      return (
        <g {...common}>
          <rect x="-6" y="-6" width="12" height="12" rx="2.5" />
          <path d="M-2.5 -2.5h5v5h-5z" />
        </g>
      );
  }
}

function Diagram() {
  const base = useId().replace(/[:]/g, '');
  const [hot, setHot] = useState<number | null>(null);

  return (
    <div className="scene-diagram mt-8">
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Office, teaching, family and platform all feed one School Hub, which serves your school."
      >
        <defs>
          {howItWorks.nodes.map((node, i) => (
            <TravellingGradient
              key={`${node.id}-${hot === i ? 'hot' : 'calm'}`}
              id={`${base}-g${i}`}
              from={SRC_X}
              to={OUT.x}
              delay={DELAYS[i]}
              cycle={hot === i ? CYCLE_HOT : CYCLE}
            />
          ))}
          <linearGradient id={`${base}-mark`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00E0F8" />
            <stop offset="1" stopColor="#0040F8" />
          </linearGradient>
          <radialGradient id={`${base}-hubglow`}>
            <stop offset="0" stopColor="#0080F8" stopOpacity="0.22" />
            <stop offset="1" stopColor="#0080F8" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={HUB.x} cy={HUB.y} r={HUB.r * 2.6} fill={`url(#${base}-hubglow)`} />

        {/* the four feeds */}
        {howItWorks.nodes.map((node, i) => {
          const d = sourcePath(SRC_Y[i]);
          return (
            <g key={node.id}>
              <path
                d={d}
                fill="none"
                stroke="var(--steel-300)"
                strokeWidth="1"
                strokeOpacity={hot === i ? 0.95 : 0.55}
                style={{ transition: 'stroke-opacity 400ms var(--ease-scene)' }}
              />
              <path
                d={fullPath(SRC_Y[i])}
                fill="none"
                stroke={`url(#${base}-g${i})`}
                strokeWidth={hot === i ? 3 : 2}
                strokeLinecap="round"
                style={{ transition: 'stroke-width 400ms var(--ease-scene)' }}
              />
            </g>
          );
        })}

        {/* and the one line out */}
        <path d={OUT_PATH} fill="none" stroke="var(--steel-300)" strokeWidth="1" strokeOpacity="0.55" />

        {/* source nodes */}
        {howItWorks.nodes.map((node, i) => (
          <g
            key={node.id}
            onMouseEnter={() => setHot(i)}
            onMouseLeave={() => setHot((v) => (v === i ? null : v))}
            onFocus={() => setHot(i)}
            onBlur={() => setHot((v) => (v === i ? null : v))}
            tabIndex={0}
            role="img"
            aria-label={`${node.label}: ${node.blurb}`}
            className="diagram-node"
          >
            <text
              x={SRC_X - NODE_R - 14}
              y={SRC_Y[i] + 3.5}
              textAnchor="end"
              className="eyebrow"
              style={{ fontSize: 10, letterSpacing: '0.24em', fill: 'var(--steel-500)' }}
            >
              {node.label.toUpperCase()}
            </text>
            <circle
              cx={SRC_X}
              cy={SRC_Y[i]}
              r={NODE_R}
              fill="rgb(255 255 255 / 0.9)"
              stroke={hot === i ? 'var(--brand-blue-mid)' : 'var(--steel-300)'}
              strokeWidth="1"
              style={{ transition: 'stroke 400ms var(--ease-scene)' }}
            />
            <g
              transform={`translate(${SRC_X} ${SRC_Y[i]})`}
              style={{
                color: hot === i ? 'var(--brand-blue)' : 'var(--steel-700)',
                transition: 'color 400ms var(--ease-scene)',
              }}
            >
              <NodeGlyph kind={node.id} />
            </g>
          </g>
        ))}

        {/* the hub */}
        <circle
          cx={HUB.x}
          cy={HUB.y}
          r={HUB.r}
          fill="rgb(255 255 255 / 0.95)"
          stroke="var(--brand-blue-mid)"
          strokeWidth="1.2"
        />
        {/* the bot's eye-plate mark, in the ratio of the source art (481x254) */}
        <image
          href={ASSETS.botMark}
          x={HUB.x - 20}
          y={HUB.y - 21}
          width="40"
          height="21"
          preserveAspectRatio="xMidYMid meet"
        />
        {/* two lines, so the wordmark sits INSIDE the circle instead of
            overrunning its edge as the single line did */}
        <text
          x={HUB.x}
          y={HUB.y + 6}
          textAnchor="middle"
          className="eyebrow"
          style={{ fontSize: 7.5, letterSpacing: '0.18em', fill: 'var(--ink)' }}
        >
          SCHOOL
        </text>
        <text
          x={HUB.x}
          y={HUB.y + 17}
          textAnchor="middle"
          className="eyebrow"
          style={{ fontSize: 7.5, letterSpacing: '0.18em', fill: 'var(--ink)' }}
        >
          HUB
        </text>

        {/* the one output */}
        <circle
          cx={OUT.x}
          cy={OUT.y}
          r={OUT.r}
          fill="rgb(255 255 255 / 0.9)"
          stroke="var(--steel-300)"
          strokeWidth="1"
        />
        <path
          d={`M ${OUT.x - 7} ${OUT.y + 5} v -7 l 7 -5 l 7 5 v 7 z`}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <text
          x={OUT.x}
          y={OUT.y + OUT.r + 16}
          textAnchor="middle"
          className="eyebrow"
          style={{ fontSize: 9, letterSpacing: '0.22em', fill: 'var(--steel-500)' }}
        >
          YOUR SCHOOL
        </text>
      </svg>
    </div>
  );
}

/** Section 02 — CHANGES-V2 §I. Copy on the left, the diagram beneath it. */
export function HowItWorks() {
  return (
    <Scene meta={meta}>
      <SceneItem>
        <Eyebrow num={meta.num} label={meta.eyebrow} />
      </SceneItem>
      <SceneItem>
        <SceneHeading id="how-it-works-heading">{howItWorks.heading}</SceneHeading>
      </SceneItem>
      <SceneItem>
        <SceneLead>{howItWorks.lead}</SceneLead>
      </SceneItem>
      <SceneItem>
        <p className="body-copy chrome-legible mt-3 max-w-[34rem] text-[0.92rem] text-steel-700">
          {howItWorks.second}
        </p>
      </SceneItem>
      <SceneItem>
        <Diagram />
      </SceneItem>
    </Scene>
  );
}
