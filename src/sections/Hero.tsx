import { motion } from 'framer-motion';
import { Eyebrow, SCENE_SHELL, SceneItem } from '../components/Scene';
import { BookDemo, ExploreFeatures, FeatureChips } from '../components/Cta';
import { TypedLine } from '../components/TypedLine';
import { inView, stagger } from '../lib/motion';
import { hero } from '../data/content';
import { sectionById } from '../data/sections';

const meta = sectionById('start');

export function Hero({ reduced }: { reduced: boolean }) {
  return (
    <section
      id={meta.id}
      aria-labelledby="start-heading"
      className={`${SCENE_SHELL} md:justify-start`}
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="relative w-full max-w-[34rem]"
      >
        <SceneItem>
          <Eyebrow num={meta.num} label={meta.eyebrow} />
        </SceneItem>

        <SceneItem>
          <h1 id="start-heading" className="display hero-display chrome-legible">
            <span className="block">{hero.titleLines[0]}</span>
            <span className="block">{hero.titleLines[1]}</span>
          </h1>
        </SceneItem>

        <SceneItem>
          <TypedLine lead={hero.typed.lead} accent={hero.typed.accent} reduced={reduced} />
        </SceneItem>

        <SceneItem>
          <p className="body-copy chrome-legible mt-6 max-w-[30rem] text-[0.95rem] text-steel-700">{hero.body}</p>
        </SceneItem>

        <SceneItem>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <BookDemo large />
            <ExploreFeatures />
          </div>
        </SceneItem>

        <SceneItem>
          <FeatureChips items={hero.chips} />
        </SceneItem>

        <SceneItem>
          <div className="mt-12 flex items-center gap-3">
            <span
              aria-hidden="true"
              className={`block h-8 w-px bg-gradient-to-b from-accent to-transparent ${
                reduced ? '' : 'scroll-rule'
              }`}
            />
            <span className="eyebrow text-steel-500">{hero.scrollHint}</span>
          </div>
        </SceneItem>
      </motion.div>
    </section>
  );
}
