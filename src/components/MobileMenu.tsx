import { useEffect, useRef } from 'react';
import { SECTIONS } from '../data/sections';
import { scrollToSection, setScrollLocked } from '../lib/navigate';
import { BookDemo, LoginLink } from './Cta';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen overlay menu below `lg`, listing every section from the rail.
 * Traps focus, closes on Esc, restores focus to the trigger, and locks the
 * page (including Lenis) while it is open.
 */
export function MobileMenu({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    setScrollLocked(true);
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = '';
      setScrollLocked(false);
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="fixed inset-0 z-50 flex flex-col bg-paper/95 backdrop-blur-md lg:hidden"
    >
      <div className="flex items-center justify-between px-6 py-5">
        <span className="eyebrow text-steel-500">Menu</span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-steel-300 text-ink"
          aria-label="Close menu"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M2 2 14 14M14 2 2 14"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 pb-8" aria-label="All sections">
        <ul className="space-y-1">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  window.setTimeout(() => scrollToSection(section.id), 40);
                }}
                className="flex items-baseline gap-4 border-b border-steel-100 py-3"
              >
                <span className="eyebrow tabular-nums text-steel-500/70">{section.num}</span>
                <span className="display text-[1.4rem]">{section.railLabel}</span>
              </a>
            </li>
          ))}
        </ul>
        {/* clicks bubble up from the two links (including keyboard Enter), so
            following either of them also closes the overlay */}
        <div className="mt-8 flex items-center gap-6" onClick={onClose}>
          <BookDemo />
          <LoginLink />
        </div>
      </nav>
    </div>
  );
}
