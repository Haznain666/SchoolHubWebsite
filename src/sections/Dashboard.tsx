import { motion } from 'framer-motion';

import { Bento } from '../components/Bento';
import { Eyebrow, SCENE_SHELL, SceneHeading, SceneItem, SceneLead } from '../components/Scene';
import { inView, stagger } from '../lib/motion';
import { dashboard } from '../data/content';
import { sectionById } from '../data/sections';

const meta = sectionById('dashboard');

/**
 * Section 10 — the bento (CHANGES-V2 §G.2). The grid takes the right ~55% of
 * the screen; the copy holds the left; the bot sits in the gutter to the RIGHT of the grid
 * (`model.position.x = +0.85`) because the grid runs to x≈1185 of 1440 and the
 * left is taken by the rail and the copy column. The halo
 * (x .10) all hold the left.
 */
export function Dashboard() {
  return (
    <section
      id={meta.id}
      aria-labelledby="dashboard-heading"
      data-align={meta.align}
      className={`${SCENE_SHELL} md:justify-start`}
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="relative grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-10"
      >
        <div>
          <SceneItem>
            <Eyebrow num={meta.num} label={meta.eyebrow} />
          </SceneItem>
          <SceneItem>
            <SceneHeading id="dashboard-heading">{dashboard.heading}</SceneHeading>
          </SceneItem>
          <SceneItem>
            <SceneLead>{dashboard.lead}</SceneLead>
          </SceneItem>
        </div>

        <SceneItem>
          <Bento />
        </SceneItem>
      </motion.div>
    </section>
  );
}
