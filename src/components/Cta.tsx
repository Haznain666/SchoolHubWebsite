import { LINKS } from '../data/sections';

interface CtaProps {
  className?: string;
  large?: boolean;
}

/** Solid navy pill → #contact. Arrow translates +4px on hover. */
export function BookDemo({ className = '', large = false }: CtaProps) {
  return (
    <a
      href={LINKS.demo}
      className={`cta-primary ${large ? 'px-7 py-3.5 text-[0.72rem] sm:text-[0.65rem]' : ''} ${className}`}
      aria-keyshortcuts="K"
    >
      Book a Demo
      <span className="cta-arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}

/** Text-only login link → the live product. */
export function LoginLink({ className = '' }: CtaProps) {
  return (
    <a
      href={LINKS.login}
      className={`cta-secondary ${className}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-keyshortcuts="L"
    >
      Login
    </a>
  );
}

/** Outlined pill used beside the hero's primary CTA. */
export function ExploreFeatures({ className = '' }: CtaProps) {
  return (
    <a href="#students" className={`cta-outline px-7 py-3.5 text-[0.72rem] sm:text-[0.65rem] ${className}`}>
      Explore Features
    </a>
  );
}

/** ✓ Students · ✓ Teachers · … — the my-skoolz device under the hero CTAs. */
export function FeatureChips({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
      {items.map((label) => (
        <li key={label} className="flex items-center gap-1.5">
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            aria-hidden="true"
            className="shrink-0 text-brand-mid"
          >
            <path
              d="M1.5 6.4 4.3 9.2 10.5 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="body-copy text-[0.78rem] text-steel-700">{label}</span>
        </li>
      ))}
    </ul>
  );
}
