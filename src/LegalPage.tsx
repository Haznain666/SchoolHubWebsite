import { CookieConsent } from './components/CookieConsent';
import { Hairlines } from './components/Hairlines';
import { ASSETS } from './lib/asset';
import type { LegalDoc } from './data/legal';

/**
 * The shell every standalone legal page renders into.
 *
 * Deliberately plain: no 3D layer, no scroll machine, no scene presets. These
 * pages are read, not scrolled through as scenes, and loading the WebGL chunk
 * to read a privacy policy would be absurd. They share the tokens, the
 * typography and the hairlines so they still belong to the site.
 */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <Hairlines />

      <header className="legal-header">
        <a href="/" aria-label="School Hub — back to the site">
          <img
            src={ASSETS.logo}
            alt="School Hub"
            className="h-[26px] w-auto"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(1,17,46,.18))' }}
          />
        </a>
        <a className="cta-secondary" href="/">
          ← Back to the site
        </a>
      </header>

      <main id="main" className="legal-main">
        <p className="eyebrow text-steel-500">{doc.eyebrow}</p>
        <h1 className="display mt-3 text-[clamp(2rem,5vw,3.2rem)]">{doc.title}</h1>
        <p className="eyebrow mt-4 text-steel-500">Last updated {doc.updated}</p>
        <p className="body-copy mt-6 max-w-[42rem] text-[1rem] text-steel-700">{doc.intro}</p>

        <div className="legal-note">
          <p className="body-copy text-[0.82rem] text-steel-700">
            <strong className="text-ink">A note on this draft.</strong> This page describes how
            School Hub actually works, but it has not been reviewed by a lawyer. Treat it as a
            starting point rather than as final legal advice.
          </p>
        </div>

        {doc.sections.map((section) => (
          <section key={section.heading} className="legal-section">
            <h2 className="display text-[1.35rem]">{section.heading}</h2>
            {section.paragraphs?.map((p) => (
              <p key={p} className="body-copy mt-3 max-w-[42rem] text-[0.92rem] text-steel-700">
                {p}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-3 max-w-[42rem] space-y-2">
                {section.bullets.map((b) => (
                  <li key={b} className="legal-bullet body-copy text-[0.92rem] text-steel-700">
                    {b}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </main>

      <footer className="legal-footer">
        <nav aria-label="Legal">
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="/cookies.html">Cookies</a>
          <a href="/copyright.html">Copyright</a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('schoolhub:cookie-settings'))}
          >
            Cookie settings
          </button>
        </nav>
        <p className="eyebrow mt-5 text-steel-500">© 2026 School Hub — All rights reserved.</p>
      </footer>

      <CookieConsent />
    </>
  );
}
