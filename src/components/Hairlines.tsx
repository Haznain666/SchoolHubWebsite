/**
 * The four vertical hairlines (BRIEF §5.4): 1px, full height, fixed, at
 * 20/40/60/80% of the viewport. Steel on the light theme. Hidden below lg.
 *
 * They sit in front of the bot layer and the scrim, and behind the page
 * content — z-3 in the stack App.tsx documents.
 */
export function Hairlines() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[3] hidden lg:block">
      {[20, 40, 60, 80].map((pct) => (
        <span key={pct} className="hairline" style={{ left: `${pct}%` }} />
      ))}
    </div>
  );
}
