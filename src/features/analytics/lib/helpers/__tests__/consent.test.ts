import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildGtagConsent, parseStoredConsent, readConsent, writeConsent } from "../consent";
import { CONSENT_STORAGE_KEY, CONSENT_UPDATED_EVENT } from "../../constants/consent";

describe("analytics consent", () => {
  beforeEach(() => window.localStorage.clear());

  it("never grants advertising storage", () => {
    expect(buildGtagConsent("granted")).toEqual({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    expect(buildGtagConsent("denied").analytics_storage).toBe("denied");
  });

  it("has no decision until the visitor chooses", () => {
    expect(readConsent()).toBeNull();
  });

  it("stores the decision and announces it", () => {
    const listener = vi.fn();
    window.addEventListener(CONSENT_UPDATED_EVENT, listener);
    writeConsent("denied");
    expect(readConsent()).toBe("denied");
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(CONSENT_UPDATED_EVENT, listener);
  });

  it("ignores malformed or outdated decisions", () => {
    expect(parseStoredConsent("not json")).toBeNull();
    expect(parseStoredConsent(JSON.stringify({ analytics: "granted", version: 0 }))).toBeNull();
    expect(parseStoredConsent(JSON.stringify({ analytics: "maybe", version: 1 }))).toBeNull();
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ analytics: "granted", version: 1 }));
    expect(readConsent()).toBe("granted");
  });
});
