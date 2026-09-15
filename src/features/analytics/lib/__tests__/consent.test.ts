import { describe, expect, it } from "vitest";
import {
  ALL_DENIED_CONSENT,
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_COOKIE_NAME,
  CONSENT_UPDATED_EVENT,
  buildConsentCookieString,
  buildConsentDefaultArgs,
  buildConsentUpdateArgs,
  hasAnalyticsConsent,
  parseConsentCookie,
  readConsentFromCookieHeader,
  serializeConsentCookie,
  type ConsentStateType,
} from "../consent";

const granted: ConsentStateType = {
  analytics_storage: "granted",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "granted",
};

describe("consent state", () => {
  it("defaults every Consent Mode v2 signal to denied", () => {
    expect(ALL_DENIED_CONSENT).toEqual({
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });

  it("only reports analytics consent when analytics_storage is granted", () => {
    expect(hasAnalyticsConsent(ALL_DENIED_CONSENT)).toBe(false);
    expect(hasAnalyticsConsent(granted)).toBe(true);
    expect(hasAnalyticsConsent(null)).toBe(false);
  });
});

describe("consent cookie serialisation", () => {
  it("round-trips a consent state through the cookie value", () => {
    const value = serializeConsentCookie(granted);
    expect(parseConsentCookie(value)).toEqual(granted);
  });

  it("produces a value safe to store without URL-encoding issues", () => {
    const value = serializeConsentCookie(granted);
    expect(value).toMatch(/^[A-Za-z0-9_,:.-]+$/);
    expect(value).not.toContain(";");
  });

  it("rejects malformed, partial or tampered values", () => {
    expect(parseConsentCookie("")).toBeNull();
    expect(parseConsentCookie("garbage")).toBeNull();
    expect(parseConsentCookie("v1.analytics_storage:granted")).toBeNull();
    expect(parseConsentCookie("v1.analytics_storage:maybe,ad_storage:denied,ad_user_data:denied,ad_personalization:denied")).toBeNull();
    expect(parseConsentCookie(undefined)).toBeNull();
  });

  it("reads the consent cookie out of a document.cookie string", () => {
    const header = `theme=dark; ${CONSENT_COOKIE_NAME}=${serializeConsentCookie(granted)}; other=1`;
    expect(readConsentFromCookieHeader(header)).toEqual(granted);
  });

  it("returns null when the cookie header has no consent cookie", () => {
    expect(readConsentFromCookieHeader("theme=dark")).toBeNull();
    expect(readConsentFromCookieHeader("")).toBeNull();
  });

  it("builds a Set-Cookie compatible string with hardened attributes", () => {
    const cookie = buildConsentCookieString(granted);
    expect(cookie.startsWith(`${CONSENT_COOKIE_NAME}=`)).toBe(true);
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain(`Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}`);
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Secure");
    expect(CONSENT_COOKIE_MAX_AGE_SECONDS).toBe(180 * 24 * 60 * 60);
  });
});

describe("gtag consent command builders", () => {
  it("builds the consent default call with every signal denied", () => {
    const [command, action, params] = buildConsentDefaultArgs();
    expect(command).toBe("consent");
    expect(action).toBe("default");
    expect(params).toEqual({ ...ALL_DENIED_CONSENT, wait_for_update: 500 });
  });

  it("builds the consent update call from a stored state", () => {
    expect(buildConsentUpdateArgs(granted)).toEqual(["consent", "update", granted]);
  });

  it("exposes the DOM event name the future banner must dispatch", () => {
    expect(CONSENT_UPDATED_EVENT).toBe("stamp:consent-updated");
  });
});
