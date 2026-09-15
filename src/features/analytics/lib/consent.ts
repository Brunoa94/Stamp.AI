/**
 * Google Consent Mode v2 groundwork.
 *
 * Pure, framework-free helpers shared by the GoogleAnalytics loader and the
 * (pending) cookie banner. The banner UI is intentionally not part of this
 * module; see docs/GDPR.md for what it must do.
 */

export type ConsentSignalType = "granted" | "denied";

export type ConsentStateType = {
  analytics_storage: ConsentSignalType;
  ad_storage: ConsentSignalType;
  ad_user_data: ConsentSignalType;
  ad_personalization: ConsentSignalType;
};

export type ConsentKeyType = keyof ConsentStateType;

export type GtagConsentArgsType = [
  "consent",
  "default" | "update",
  Record<string, unknown>,
];

export const CONSENT_KEYS: readonly ConsentKeyType[] = [
  "analytics_storage",
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
] as const;

export const ALL_DENIED_CONSENT: ConsentStateType = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

export const CONSENT_COOKIE_NAME = "stamp_consent";
export const CONSENT_COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;
/** Dispatched on `window` by the banner after it persists a new choice. */
export const CONSENT_UPDATED_EVENT = "stamp:consent-updated";
/** Milliseconds gtag waits for a consent update before firing queued hits. */
const CONSENT_WAIT_FOR_UPDATE_MS = 500;
const COOKIE_VERSION = "v1";

function isConsentSignal(value: string): value is ConsentSignalType {
  return value === "granted" || value === "denied";
}

export function hasAnalyticsConsent(state: ConsentStateType | null): boolean {
  return state?.analytics_storage === "granted";
}

/** `v1.analytics_storage:denied,ad_storage:denied,...` — cookie-safe characters only. */
export function serializeConsentCookie(state: ConsentStateType): string {
  const pairs = CONSENT_KEYS.map((key) => `${key}:${state[key]}`);
  return `${COOKIE_VERSION}.${pairs.join(",")}`;
}

export function parseConsentCookie(
  raw: string | null | undefined,
): ConsentStateType | null {
  if (!raw) return null;

  const separator = raw.indexOf(".");
  if (separator === -1 || raw.slice(0, separator) !== COOKIE_VERSION) {
    return null;
  }

  const parsed: Partial<Record<ConsentKeyType, ConsentSignalType>> = {};
  for (const pair of raw.slice(separator + 1).split(",")) {
    const [key, value] = pair.split(":");
    if (!CONSENT_KEYS.includes(key as ConsentKeyType)) return null;
    if (!value || !isConsentSignal(value)) return null;
    parsed[key as ConsentKeyType] = value;
  }

  const complete = CONSENT_KEYS.every((key) => parsed[key] !== undefined);
  return complete ? (parsed as ConsentStateType) : null;
}

/** Reads the consent cookie from a `document.cookie`-style string. */
export function readConsentFromCookieHeader(
  cookieHeader: string,
): ConsentStateType | null {
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === CONSENT_COOKIE_NAME) {
      return parseConsentCookie(rest.join("="));
    }
  }
  return null;
}

/** Value for `document.cookie = ...` (or a Set-Cookie header). */
export function buildConsentCookieString(state: ConsentStateType): string {
  return [
    `${CONSENT_COOKIE_NAME}=${serializeConsentCookie(state)}`,
    "Path=/",
    `Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    "Secure",
  ].join("; ");
}

/** Must be pushed to the dataLayer before any `config` command. */
export function buildConsentDefaultArgs(): GtagConsentArgsType {
  return [
    "consent",
    "default",
    { ...ALL_DENIED_CONSENT, wait_for_update: CONSENT_WAIT_FOR_UPDATE_MS },
  ];
}

export function buildConsentUpdateArgs(
  state: ConsentStateType,
): GtagConsentArgsType {
  return ["consent", "update", { ...state }];
}
