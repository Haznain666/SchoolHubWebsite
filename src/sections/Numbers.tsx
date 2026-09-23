import { Eyebrow, Scene, SceneHeading, SceneItem, SceneLead } from '../components/Scene';
import { StatCard } from '../components/StatCard';
import { numbers } from '../data/content';
import { sectionById } from '../data/sections';

const meta = sectionById('numbers');

export function Numbers({ reduced }: { reduced: boolean }) {
  return (
    <Scene meta={meta}>
      <SceneItem>
        <Eyebrow num={meta.num} label={meta.eyebrow} />
      </SceneItem>
      <SceneItem>
        <SceneHeading id="numbers-heading">{numbers.heading}</SceneHeading>
      </SceneItem>
      <SceneItem>
        <SceneLead>{numbers.lead}</SceneLead>
      </SceneItem>
      <SceneItem>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {numbers.stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} reduced={reduced} />
          ))}
        </div>
      </SceneItem>
      <SceneItem>
        <p className="body-copy mt-5 text-[0.72rem] leading-relaxed text-steel-700">
          {numbers.footnote}
        </p>
      </SceneItem>
    </Scene>
  );
}
