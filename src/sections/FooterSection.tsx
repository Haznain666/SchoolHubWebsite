import { motion } from 'framer-motion';

import { Eyebrow, SCENE_SHELL, SceneItem } from '../components/Scene';
import { inView, stagger } from '../lib/motion';
import { footer } from '../data/content';
import { scrollToSection } from '../lib/navigate';
import { sectionById } from '../data/sections';

const meta = sectionById('footer');

/* ---- inline SVG only: no icon library (BRIEF §2) --------------------- */

function Glyph({ name }: { name: string }) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'linkedin':
      return (
        <g fill="currentColor">
          <rect x="3" y="7" width="2.6" height="8" rx="0.4" />
          <circle cx="4.3" cy="4.3" r="1.4" />
          <path d="M8 15V7h2.5v1.1A2.9 2.9 0 0 1 16 9.6V15h-2.6v-4.6a1.3 1.3 0 0 0-2.6 0V15z" />
        </g>
      );
    case 'x':
      return (
        <g fill="currentColor">
          <path d="M4 4h3.1l3.2 4.3L13.9 4H16l-4.6 5.5L16.4 16h-3.1l-3.4-4.6L6 16H3.9l4.8-5.8z" />
        </g>
      );
    case 'youtube':
      return (
        <g fill="currentColor">
          <rect x="2.6" y="5.4" width="14.8" height="9.2" rx="2.6" />
          <path d="M8.4 8.2v3.6L11.7 10z" fill="#fff" />
        </g>
      );
    case 'mail':
      return (
        <g {...stroke}>
          <rect x="3" y="5.4" width="14" height="9.2" rx="1.6" />
          <path d="m3.6 6.4 6.4 4.4 6.4-4.4" />
        </g>
      );
    case 'flow':
      return (
        <g {...stroke}>
          <circle cx="5" cy="6" r="1.6" />
          <circle cx="5" cy="14" r="1.6" />
          <circle cx="15" cy="10" r="1.8" />
          <path d="M6.5 6.6c3 .6 4 1.8 6.8 3M6.5 13.4c3-.6 4-1.8 6.8-3" />
        </g>
      );
    case 'grid':
      return (
        <g {...stroke}>
          <rect x="3.4" y="3.4" width="5.6" height="5.6" rx="1.2" />
          <rect x="11" y="3.4" width="5.6" height="5.6" rx="1.2" />
          <rect x="3.4" y="11" width="5.6" height="5.6" rx="1.2" />
          <rect x="11" y="11" width="5.6" height="5.6" rx="1.2" />
        </g>
      );
    case 'clock':
      return (
        <g {...stroke}>
          <circle cx="10" cy="10" r="6.6" />
          <path d="M10 6.2V10l2.6 1.6" />
        </g>
      );
    default:
      return (
        <g {...stroke}>
          <path d="M3.6 6.4a2 2 0 0 1 2-2h8.8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8.2L5 16v-2.6h-.4a2 2 0 0 1-2-2z" />
        </g>
      );
  }
}

const IconLink = ({
  label,
  glyph,
  href,
  onClick,
}: {
  label: string;
  glyph: string;
  href: string;
  onClick?: (e: React.MouseEvent) => void;
}) => (
  <a
    href={href}
    aria-label={label}
    title={label}
    onClick={onClick}
    {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
    className="flex h-11 w-11 items-center justify-center rounded-full border border-steel-100 bg-paper-2/70 sm:h-9 sm:w-9 text-steel-500 transition-all duration-300 ease-scene hover:-translate-y-[2px] hover:border-accent/40 hover:text-ink"
  >
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <Glyph name={glyph} />
    </svg>
  </a>
);

/**
 * Section 14 — the footer (CHANGES-V2 §G.4).
 *
 * It is a full scene like any other, not a bar stuck at the bottom: the bot is
 * large on the right, the halo is visible behind it, and the content sits
 * centre-left. The order below is §G.4's, item for item.
 */
export function FooterSection() {
  return (
    <section
      id={meta.id}
      aria-labelledby="footer-heading"
      data-align={meta.align}
      className={`${SCENE_SHELL} md:items-center md:justify-start`}
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="relative w-full max-w-[56rem]"
      >
        {/* 1 — the eyebrow */}
        <SceneItem>
          <Eyebrow num={meta.num} label={meta.eyebrow} />
        </SceneItem>

        {/* 2 — a short paragraph. The logo that used to sit here was struck
             out in review: the eyebrow directly above already reads
             "14  SCHOOL HUB", so the mark was saying it twice. */}
        <SceneItem>
          <div>
            <h2 id="footer-heading" className="sr-only">
              School Hub
            </h2>
            <p className="body-copy chrome-legible mt-4 max-w-[26rem] text-[0.82rem] text-steel-700">
              {footer.blurb}
            </p>
          </div>
        </SceneItem>

        {/* 3 — the social row */}
        <SceneItem>
          <div className="mt-5 flex items-center gap-2">
            {footer.social.map((s) => (
              <IconLink key={s.label} label={s.label} glyph={s.glyph} href={s.href} />
            ))}
          </div>
        </SceneItem>

        {/* 4 — the link columns */}
        <SceneItem>
          <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3">
            {footer.columns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-steel-500">{col.title}</p>
                <ul className="mt-4 space-y-2">
                  {col.links.map((link) => {
                    const external = 'external' in link && link.external;
                    // `#cookie-settings` is not a section — it opens the consent
                    // panel, so it must NOT be handed to the scroll machine
                    const settings = link.href === '#cookie-settings';
                    const anchor = link.href.startsWith('#') && !settings;
                    return (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                          {...(settings
                            ? {
                                onClick: (e: React.MouseEvent) => {
                                  e.preventDefault();
                                  window.dispatchEvent(new Event('schoolhub:cookie-settings'));
                                },
                              }
                            : {})}
                          {...(anchor
                            ? {
                                onClick: (e: React.MouseEvent) => {
                                  e.preventDefault();
                                  scrollToSection(link.href.slice(1));
                                },
                              }
                            : {})}
                          className="body-copy inline-block break-words py-1.5 text-[0.82rem] text-steel-700 transition-colors duration-300 hover:text-ink sm:py-0 sm:text-[0.78rem]"
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </SceneItem>

        {/* 6, 7, 8 — hairline divider, copyright, the render note */}
        <SceneItem>
          <div className="mt-10 border-t border-steel-100 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="body-copy text-[0.72rem] text-steel-700">{footer.copyright}</p>
              <a
                href="#start"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('start');
                }}
                className="eyebrow inline-flex min-h-[2.75rem] items-center text-steel-500 transition-colors duration-300 hover:text-ink sm:min-h-0"
              >
                Back to top ↑
              </a>
            </div>
            <p className="eyebrow mt-4 text-steel-500">{footer.renderNote}</p>
          </div>
        </SceneItem>
      </motion.div>
    </section>
  );
}
