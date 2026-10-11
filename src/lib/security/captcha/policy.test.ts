import { describe, expect, it } from "vitest";
import { captchaDecision } from "./policy";

const configured = { NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "site", RECAPTCHA_SECRET_KEY: "secret" };

describe("captchaDecision", () => {
  it("skips when CAPTCHA is not configured", () => {
    expect(captchaDecision("token", {})).toBe("skip");
    expect(captchaDecision(undefined, { CAPTCHA_REQUIRED: "true" })).toBe("skip");
  });

  it("verifies a token when configured", () => {
    expect(captchaDecision("token", configured)).toBe("verify");
  });

  it("rejects a missing token only when CAPTCHA_REQUIRED=true", () => {
    expect(captchaDecision(undefined, configured)).toBe("skip");
    expect(captchaDecision("", { ...configured, CAPTCHA_REQUIRED: "true" })).toBe("reject");
  });
});
