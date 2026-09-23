import { motion } from 'framer-motion';

import { InfoCard } from '../components/InfoCard';
import { IsoPlane } from '../components/IsoPlane';
import { Eyebrow, SCENE_SHELL, SceneHeading, SceneItem, SceneLead } from '../components/Scene';
import { inView, stagger } from '../lib/motion';
import { platform } from '../data/content';
import { sectionById } from '../data/sections';

const meta = sectionById('platform');

/**
 * Section 09 — the "Work that works" treatment (CHANGES-V2 §G.1).
 *
 * The artwork is not in the content column: the isometric plane bleeds off the
 * top-left corner of the viewport and the copy sits low-right, with the bot a
 * silhouette on the far-right edge (`model.position.x = 1.05` in §D).
 */
export function Platform() {
  return (
    <section
      id={meta.id}
      aria-labelledby="platform-heading"
      data-align={meta.align}
      className={`${SCENE_SHELL} scene-platform md:items-end md:justify-end md:pb-24`}
    >
      <IsoPlane />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="relative w-full max-w-[40rem]"
      >
        <SceneItem>
          <Eyebrow num={meta.num} label={meta.eyebrow} />
        </SceneItem>
        <SceneItem>
          <SceneHeading id="platform-heading">{platform.heading}</SceneHeading>
        </SceneItem>
        <SceneItem>
          <SceneLead>{platform.lead}</SceneLead>
        </SceneItem>
        <SceneItem>
          {/* Each portal takes a turn in the spotlight — see `.portal-cycle`.
              One shared 9s timeline, offset a third per card, so the three stay
              phase-locked however long the page has been open. */}
          <div className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {platform.portals.map((card, i) => (
              <div
                key={card.title}
                className="portal-cycle"
                style={{ '--cycle-delay': `${i * 3}s` } as React.CSSProperties}
              >
                <InfoCard index={i + 1} title={card.title} body={card.body} />
              </div>
            ))}
          </div>
        </SceneItem>
      </motion.div>
    </section>
  );
}
