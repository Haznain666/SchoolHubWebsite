import { useEffect } from 'react';

export interface KeyboardNavOptions {
  enabled: boolean;
  onPrev: () => void;
  onNext: () => void;
  onDemo: () => void;
  onLogin: () => void;
  onEscape: () => void;
  /** Home — jump to the first section. */
  onFirst: () => void;
  /** End — jump to the last section. */
  onLast: () => void;
}

const isTypingTarget = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable ||
    el.getAttribute('role') === 'textbox'
  );
};

/**
 * The keyboard legend (BRIEF §5.7) wired for real, plus the two extra keys
 * CHANGES-V2 §E.10 names.
 *
 * ↑/W/PageUp previous · ↓/S/PageDown next · Home/End first/last ·
 * K book a demo · L login · Esc close menu. Detaches entirely when the
 * legend's toggle is switched off.
 *
 * Every key that the browser would otherwise scroll with — the arrows, PageUp,
 * PageDown, Home and End — must be both handled and `preventDefault`ed. An
 * unhandled PageDown runs the browser's own page scroll, which walks the
 * document out from under the wheel state machine's step index: exactly the
 * desynchronisation §E exists to prevent.
 */
export function useKeyboardNav({
  enabled,
  onPrev,
  onNext,
  onDemo,
  onLogin,
  onEscape,
  onFirst,
  onLast,
}: KeyboardNavOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'PageUp':
          e.preventDefault();
          onPrev();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
        case 'PageDown':
          e.preventDefault();
          onNext();
          break;
        case 'Home':
          e.preventDefault();
          onFirst();
          break;
        case 'End':
          e.preventDefault();
          onLast();
          break;
        case 'k':
        case 'K':
          e.preventDefault();
          onDemo();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          onLogin();
          break;
        case 'Escape':
          onEscape();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onPrev, onNext, onDemo, onLogin, onEscape, onFirst, onLast]);
}
