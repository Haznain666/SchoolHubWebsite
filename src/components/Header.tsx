import { ASSETS } from '../lib/asset';
import { NAV_ITEMS } from '../data/sections';
import { scrollToSection } from '../lib/navigate';
import { BookDemo, LoginLink } from './Cta';

interface Props {
  activeId: string;
  onOpenMenu: () => void;
}

/**
 * The minimalist header (BRIEF §5.6): logo left, four eyebrow links centred at
 * lg and up, the two CTAs right. Deliberately shorter than the rail — that is
 * the inspiration's pattern. No DE/EN switch, no "Nominee" tag: both removed.
 *
 * Off the hero it draws itself into a frosted pill; the whole transition lives
 * in `.nav-shell` in index.css.
 */
export function Header({ activeId, onOpenMenu }: Props) {
  const condensed = activeId !== 'start';

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div
        className={`nav-shell mx-auto flex items-center justify-between ${
          condensed ? 'is-condensed' : ''
        }`}
      >
        <a
          href="#start"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('start');
          }}
          className="flex items-center"
          aria-label="School Hub — back to the top"
        >
          <img
            src={ASSETS.logo}
            alt="School Hub"
            className="h-[26px] w-auto md:h-[30px]"
            style={{
              imageRendering: 'auto',
              filter: 'drop-shadow(0 1px 2px rgba(1,17,46,.18))',
            }}
          />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  aria-current={activeId === item.id ? 'true' : undefined}
                  className={`eyebrow chrome-legible transition-colors duration-300 ease-scene hover:text-ink ${
                    activeId === item.id ? 'text-ink' : 'text-steel-500'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <LoginLink />
          <BookDemo />
        </div>

        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-steel-300 bg-paper-2/70 text-ink lg:hidden"
          aria-label="Open menu"
          aria-haspopup="dialog"
        >
          <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
            <path
              d="M0 1h16M0 6h16M0 11h16"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
