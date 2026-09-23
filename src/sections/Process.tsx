import { useId } from 'react';

import { Eyebrow, Scene, SceneHeading, SceneItem, SceneLead } from '../components/Scene';
import { InfoCard } from '../components/InfoCard';
import { TravellingGradient } from '../components/TravellingGradient';
import { process } from '../data/content';
import { sectionById } from '../data/sections';

const meta = sectionById('onboarding');

/* The connector's own coordinate system. It is stretched to the CSS gap by
   `preserveAspectRatio="none"`, which is why the strokes carry
   `vector-effect: non-scaling-stroke` — without it the non-uniform scale would
   squash the line to a hairline at one end and a slab at the other. */
const LINK = { w: 120, h: 40 };
const LINK_PATH = `M 0 2 C ${LINK.w * 0.42} 2, ${LINK.w * 0.58} ${LINK.h - 2}, ${LINK.w} ${LINK.h - 2}`;

/** Staggered like §02's four feeds, so the steps light in sequence, not together. */
const DELAYS = [0, 0.75, 1.5];
const CYCLE = 4.6; // s — matches the portal diagram exactly

/**
 * One curved hop between two steps, carrying the same travelling pulse as the
 * "How it works" portal diagram — same component, same easing, same cycle.
 */
function StepLink({ index }: { index: number }) {
  const base = useId().replace(/:/g, '');
  return (
    <svg
      className="process-link"
      viewBox={`0 0 ${LINK.w} ${LINK.h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <TravellingGradient
          id={`${base}-flow`}
          from={0}
          to={LINK.w}
          delay={DELAYS[index % DELAYS.length]}
          cycle={CYCLE}
          travel={1.1}
          band={38}
        />
      </defs>
      {/* the resting rule, always there */}
      <path
        d={LINK_PATH}
        fill="none"
        stroke="var(--steel-300)"
        strokeWidth="1"
        strokeOpacity="0.55"
        vectorEffect="non-scaling-stroke"
      />
      {/* and the pulse that runs along it */}
      <path
        d={LINK_PATH}
        fill="none"
        stroke={`url(#${base}-flow)`}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * Section 09 — the four onboarding steps, connected.
 *
 * The heading block is centred over the flow rather than left-anchored in the
 * column, and the steps cascade down-and-right so each hop has somewhere to go;
 * a flat 2x2 grid gave the connectors nowhere sensible to run.
 */
export function Process() {
  return (
    <Scene meta={meta}>
      <SceneItem>
        <div className="text-center">
          <Eyebrow num={meta.num} label={meta.eyebrow} />
        </div>
      </SceneItem>
      <SceneItem>
        <SceneHeading id="onboarding-heading" className="text-center">
          {process.heading}
        </SceneHeading>
      </SceneItem>
      <SceneItem>
        <SceneLead className="mx-auto text-center">{process.lead}</SceneLead>
      </SceneItem>
      <SceneItem>
        <ol className="process-flow mt-9">
          {process.steps.map((step, i) => (
            <li key={step.title} style={{ '--step': i } as React.CSSProperties}>
              {i > 0 ? <StepLink index={i - 1} /> : null}
              <InfoCard index={i + 1} title={step.title} body={step.body} />
            </li>
          ))}
        </ol>
      </SceneItem>
    </Scene>
  );
}
