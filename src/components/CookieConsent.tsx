import { useCallback, useEffect, useState } from 'react';

import {
  ALL_ACCEPTED,
  ALL_REJECTED,
  onConsentChange,
  readConsent,
  writeConsent,
  type Consent,
} from '../lib/consent';

/**
 * The consent banner and the settings panel behind it.
 *
 * Built out of the site's own tokens — paper surface, steel hairline, the
 * navy accent on the primary action — so it reads as part of the page rather
 * than as a bolted-on strip.
 *
 * Accept and Reject carry equal visual weight. A reject that is harder to find
 * than an accept is not a real choice, and the banner is not dismissible by
 * clicking away: doing nothing must not be read as agreement.
 */
export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);
  const [panelOpen, setPanelOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // `undefined` until the first read, so nothing flashes before we know
  useEffect(() => {
    const current = readConsent();
    setConsent(current);
    setAnalytics(current?.analytics ?? false);
    setMarketing(current?.marketing ?? false);
    return onConsentChange((c) => {
      setConsent(c);
      setAnalytics(c?.analytics ?? false);
      setMarketing(c?.marketing ?? false);
    });
  }, []);

  // the footer's "Cookie settings" link opens the panel
  useEffect(() => {
    const open = () => setPanelOpen(true);
    const onHash = () => {
      if (window.location.hash === '#cookie-settings') open();
    };
    window.addEventListener('schoolhub:cookie-settings', open);
    window.addEventListener('hashchange', onHash);
    onHash();
    return () => {
      window.removeEventListener('schoolhub:cookie-settings', open);
      window.removeEventListener('hashchange', onHash);
    };
  }, []);

  const acceptAll = useCallback(() => {
    writeConsent(ALL_ACCEPTED);
    setPanelOpen(false);
  }, []);
  const rejectAll = useCallback(() => {
    writeConsent(ALL_REJECTED);
    setPanelOpen(false);
  }, []);
  const saveChoice = useCallback(() => {
    writeConsent({ essential: true, analytics, marketing });
    setPanelOpen(false);
  }, [analytics, marketing]);

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelOpen]);

  if (consent === undefined) return null;

  const showBanner = consent === null && !panelOpen;

  return (
    <>
      {showBanner ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-banner-title"
          className="consent-banner"
        >
          <div className="consent-banner-inner">
            <div className="min-w-0">
              <p id="cookie-banner-title" className="eyebrow text-accent">
                Cookies
              </p>
              <p className="body-copy mt-2 text-[0.84rem] text-steel-700">
                This site sets no advertising or tracking cookies. We store one small
                preference so we do not ask again.{' '}
                <a className="consent-link" href="/cookies.html">
                  Read the detail
                </a>
                .
              </p>
            </div>
            <div className="consent-actions">
              <button type="button" className="cta-outline" onClick={() => setPanelOpen(true)}>
                Settings
              </button>
              <button type="button" className="cta-outline" onClick={rejectAll}>
                Reject
              </button>
              <button type="button" className="cta-primary" onClick={acceptAll}>
                Accept
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {panelOpen ? (
        <div className="consent-scrim" role="presentation" onClick={() => setPanelOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-panel-title"
            className="consent-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow text-steel-500">Cookie settings</p>
            <h2 id="cookie-panel-title" className="display mt-2 text-[1.5rem]">
              What this site may store
            </h2>
            <p className="body-copy mt-3 text-[0.84rem] text-steel-700">
              Nothing in the optional categories is active today. Your choice is recorded now
              and will be honoured if either is ever introduced.
            </p>

            <ul className="mt-6 space-y-3">
              <ConsentRow
                title="Essential"
                note="Needed for the site to work and to remember this choice. Always on."
                checked
                disabled
              />
              <ConsentRow
                title="Analytics"
                note="Which pages are read, and where people stop."
                checked={analytics}
                onChange={setAnalytics}
              />
              <ConsentRow
                title="Marketing"
                note="Whether an advert led to a demo request."
                checked={marketing}
                onChange={setMarketing}
              />
            </ul>

            <div className="consent-actions mt-7 justify-end">
              <button type="button" className="cta-outline" onClick={rejectAll}>
                Reject all
              </button>
              <button type="button" className="cta-outline" onClick={acceptAll}>
                Accept all
              </button>
              <button type="button" className="cta-primary" onClick={saveChoice}>
                Save choice
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ConsentRow({
  title,
  note,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  note: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <li className="consent-row">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="consent-check"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span className="min-w-0">
          <span className="block text-[0.88rem] font-medium text-ink">{title}</span>
          <span className="body-copy block text-[0.8rem] text-steel-700">{note}</span>
        </span>
      </label>
    </li>
  );
}
