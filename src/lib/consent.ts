/**
 * Cookie consent, stored in the visitor's own browser.
 *
 * There is no backend and, today, nothing to consent to: this site loads no
 * analytics and no third-party script. The control exists so a choice is on
 * record BEFORE anything is ever added, rather than after. `analytics` and
 * `marketing` are therefore switches that currently gate nothing — read them
 * before you add a script, and they will already be right.
 *
 * Every read and write is wrapped: storage throws in a private window, and
 * comes back empty when site data has been cleared. The page must render
 * correctly either way, so "unknown" is a first-class state and means "ask".
 */

export type ConsentCategory = 'essential' | 'analytics' | 'marketing';

export interface Consent {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  /** ISO timestamp of the decision, so a stale choice can be re-asked later */
  decidedAt: string;
}

const KEY = 'schoolhub.consent.v1';

export const ALL_ACCEPTED: Omit<Consent, 'decidedAt'> = {
  essential: true,
  analytics: true,
  marketing: true,
};

export const ALL_REJECTED: Omit<Consent, 'decidedAt'> = {
  essential: true,
  analytics: false,
  marketing: false,
};

/** `null` means no decision yet — show the banner. */
export function readConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Consent>;
    if (typeof parsed?.decidedAt !== 'string') return null;
    return {
      essential: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      decidedAt: parsed.decidedAt,
    };
  } catch {
    // private window, blocked storage, or corrupt value — treat as undecided
    return null;
  }
}

export function writeConsent(choice: Omit<Consent, 'decidedAt'>): Consent {
  const value: Consent = { ...choice, essential: true, decidedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // nothing we can do; the choice still applies for this page view
  }
  notify(value);
  return value;
}

export function clearConsent(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  notify(null);
}

/* -- a tiny subscription, so the banner and the settings panel agree ------- */

type Listener = (c: Consent | null) => void;
const listeners = new Set<Listener>();

export function onConsentChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(c: Consent | null): void {
  listeners.forEach((fn) => fn(c));
}
