import { useEffect, useId, useRef, useState } from 'react';

interface Item {
  q: string;
  a: string;
}

/**
 * The FAQ panel (CHANGES-V2 §G.3) — deliberately not a conventional accordion.
 *
 * The three questions stay stacked and never push each other apart: the active
 * one takes a left rule in the accent colour and full ink, the others stay
 * muted, and the answer cross-fades below the stack (out 150ms, in 250ms).
 *
 * Keyboard: a roving tabindex with manual activation. Arrow keys (and Home /
 * End) move between the questions, Enter or Space selects.
 */
export function FaqPanel({ items }: { items: readonly Item[] }) {
  const base = useId().replace(/[:]/g, '');
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(0);
  const [shown, setShown] = useState(0);
  const [visible, setVisible] = useState(true);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  /* fade the old answer out, swap it, fade the new one in */
  useEffect(() => {
    if (active === shown) return;
    setVisible(false);
    const id = window.setTimeout(() => {
      setShown(active);
      setVisible(true);
    }, 150);
    return () => window.clearTimeout(id);
  }, [active, shown]);

  const move = (to: number) => {
    const next = (to + items.length) % items.length;
    setFocused(next);
    buttons.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        move(i + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        move(i - 1);
        break;
      case 'Home':
        e.preventDefault();
        move(0);
        break;
      case 'End':
        e.preventDefault();
        move(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setActive(i);
        break;
      default:
        break;
    }
  };

  return (
    <div className="faq-panel mt-8">
      <p className="eyebrow text-steel-500">In detail</p>

      <div role="tablist" aria-orientation="vertical" className="mt-5 space-y-1">
        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <button
              key={item.q}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${i}`}
              aria-selected={isActive}
              aria-controls={`${base}-panel`}
              tabIndex={i === focused ? 0 : -1}
              onFocus={() => setFocused(i)}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`faq-question ${isActive ? 'is-active' : ''}`}
            >
              <span aria-hidden="true" className="faq-rule" />
              <span className="display text-[1.15rem] leading-[1.3]">{item.q}</span>
            </button>
          );
        })}
      </div>

      <div
        id={`${base}-panel`}
        role="tabpanel"
        aria-labelledby={`${base}-tab-${shown}`}
        className="mt-6 border-t border-steel-100 pt-5"
      >
        <p
          className="body-copy min-h-[5.2rem] max-w-[34rem] text-[0.86rem] text-steel-700"
          style={{
            opacity: visible ? 1 : 0,
            transition: visible ? 'opacity 250ms ease-out' : 'opacity 150ms ease-in',
          }}
        >
          {items[shown].a}
        </p>
      </div>
    </div>
  );
}
