import { FaqPanel } from '../components/FaqPanel';
import { Eyebrow, Scene, SceneHeading, SceneItem, SceneLead } from '../components/Scene';
import { faq } from '../data/content';
import { sectionById } from '../data/sections';

const meta = sectionById('faq');

/** Section 12 — the reference's panel style (CHANGES-V2 §G.3). */
export function Faq() {
  return (
    <Scene meta={meta}>
      <SceneItem>
        <Eyebrow num={meta.num} label={meta.eyebrow} />
      </SceneItem>
      <SceneItem>
        <SceneHeading id="faq-heading">{faq.heading}</SceneHeading>
      </SceneItem>
      <SceneItem>
        <SceneLead>{faq.lead}</SceneLead>
      </SceneItem>
      <SceneItem>
        <FaqPanel items={faq.items} />
      </SceneItem>
    </Scene>
  );
}
