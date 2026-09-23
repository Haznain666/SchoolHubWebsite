import { SECTIONS } from '../data/sections';
import { scrollToSection } from '../lib/navigate';

interface Props {
  activeIndex: number;
}

/**
 * The "On this page" rail (BRIEF §5.5). The whole mechanic is that one dash:
 * active → w-10 + bg-accent with the label at full ink; inactive → w-4 +
 * bg-steel-300 with a muted label. Both transition over 500ms.
 * Every entry is derived from SECTIONS, so the rail can never drift from the
 * page.
 */
export function Rail({ activeIndex }: Props) {
  return (
    <aside
      aria-label="On this page"
      className="fixed left-8 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:left-12"
    >
      <p className="eyebrow chrome-legible mb-6 text-steel-500/70">On this page</p>
      <ul className="space-y-4">
        {SECTIONS.map((section, i) => {
          const active = i === activeIndex;
          return (
            <li key={section.id}>
              <a
                className="group flex items-center text-left"
                href={`#${section.id}`}
                aria-current={active ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(section.id);
                }}
              >
                <span
                  className={`mr-4 h-px transition-all duration-500 ease-scene ${
                    active ? 'w-10 bg-accent' : 'w-4 bg-steel-300 group-hover:bg-steel-500'
                  }`}
                />
                <span
                  className={`chrome-legible text-[0.8rem] font-light tracking-wide transition-colors duration-500 ease-scene ${
                    active ? 'text-ink' : 'text-steel-500/70 group-hover:text-ink/70'
                  }`}
                >
                  {section.railLabel}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
