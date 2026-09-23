interface Props {
  enabled: boolean;
  onToggle: () => void;
}

const ROWS: { keys: string[]; label: string }[] = [
  { keys: ['↑', '↓', 'W', 'S'], label: 'Change section' },
  { keys: ['K'], label: 'Book a demo' },
  { keys: ['L'], label: 'Login' },
  { keys: ['Esc'], label: 'Close menu' },
];

/**
 * The keyboard navigation legend (BRIEF §5.7), bottom-right because the
 * language switch that used to live there has been removed. The pill is a real
 * toggle: switched off, the list fades to 40% and `useKeyboardNav` detaches its
 * handlers.
 */
export function KeyboardLegend({ enabled, onToggle }: Props) {
  return (
    <div className="fixed bottom-8 right-8 z-30 hidden lg:block xl:right-12">
      <div className="mb-3 flex items-center justify-end gap-3">
        <span className="eyebrow chrome-legible text-steel-500/70">Navigation</span>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={enabled}
          aria-label={
            enabled ? 'Disable keyboard navigation' : 'Enable keyboard navigation'
          }
          className={`relative h-[18px] w-9 rounded-full border transition-colors duration-300 ease-scene ${
            enabled ? 'border-accent/40 bg-accent/90' : 'border-steel-300 bg-steel-100'
          }`}
        >
          <span
            className={`absolute top-[2px] block h-[12px] w-[12px] rounded-full bg-white shadow-sm transition-transform duration-300 ease-scene ${
              enabled ? 'translate-x-[20px]' : 'translate-x-[3px]'
            }`}
          />
        </button>
      </div>
      <dl
        className={`space-y-2 text-right transition-opacity duration-300 ease-scene ${
          enabled ? 'opacity-100' : 'opacity-40'
        }`}
      >
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-end gap-3">
            <dt className="flex items-center gap-1">
              {row.keys.map((k) => (
                <kbd key={k} className="kbd">
                  {k}
                </kbd>
              ))}
            </dt>
            <dd className="body-copy chrome-legible w-[7.5rem] text-left text-[0.7rem] text-steel-500">
              {row.label}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
