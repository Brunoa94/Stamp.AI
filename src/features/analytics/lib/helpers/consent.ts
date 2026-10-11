import {
  CONSENT_STORAGE_KEY,
  CONSENT_UPDATED_EVENT,
  CONSENT_VERSION,
} from "../constants/consent";

export type AnalyticsConsentType = "granted" | "denied";

export interface StoredConsentType {
  analytics: AnalyticsConsentType;
  version: number;
  updatedAt: string;
}

/** Google Consent Mode v2 state for a decision; ads are never enabled. */
export function buildGtagConsent(analytics: AnalyticsConsentType) {
  return {
    analytics_storage: analytics,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  } as const;
}

export function parseStoredConsent(raw: string | null): AnalyticsConsentType | null {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as Partial<StoredConsentType>;
    if (stored.version !== CONSENT_VERSION) return null;
    return stored.analytics === "granted" || stored.analytics === "denied" ? stored.analytics : null;
  } catch {
    return null;
  }
}

/** The decision in this browser, or null when the visitor has not chosen yet. */
export function readConsent(): AnalyticsConsentType | null {
  try {
    return parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeConsent(analytics: AnalyticsConsentType): void {
  const stored: StoredConsentType = {
    analytics,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage blocked: the choice applies to this page view only.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: analytics }));
}
