import { CardGrid, InfoCard } from '../components/InfoCard';
import { DetailList } from '../components/DetailList';
import { Eyebrow, Scene, SceneHeading, SceneItem, SceneLead } from '../components/Scene';
import type { FeatureSection } from '../data/content';
import { sectionById } from '../data/sections';

/**
 * Scenes 03–08 all share this shape: eyebrow, heading, lead and the points.
 * The pull-quote slot that used to sit under them is gone with the line it
 * carried (CHANGES-V2 §H.1).
 *
 * Most sections lay the points out as the six-card grid with the §5.9 hover.
 * Messaging and Performance instead carry four longer points as full-width
 * rows — see `DetailList`.
 */
export function FeatureScene({ section }: { section: FeatureSection }) {
  const meta = sectionById(section.id);

  return (
    <Scene meta={meta}>
      <SceneItem>
        <Eyebrow num={meta.num} label={meta.eyebrow} />
      </SceneItem>
      <SceneItem>
        <SceneHeading id={`${meta.id}-heading`}>{section.heading}</SceneHeading>
      </SceneItem>
      <SceneItem>
        <SceneLead>{section.lead}</SceneLead>
      </SceneItem>
      <SceneItem>
        {section.layout === 'list' ? (
          <DetailList items={section.cards} />
        ) : (
          <CardGrid>
            {section.cards.map((card, i) => (
              <InfoCard key={card.title} index={i + 1} title={card.title} body={card.body} />
            ))}
          </CardGrid>
        )}
      </SceneItem>
    </Scene>
  );
}
