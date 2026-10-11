import { describe, expect, it } from "vitest";
import { buildSentryOptions, scrubEvent, scrubText } from "../sentryConfig";

describe("buildSentryOptions", () => {
  it("is disabled without a DSN and in development", () => {
    expect(buildSentryOptions({ nodeEnv: "production" }).enabled).toBe(false);
    expect(buildSentryOptions({ dsn: "https://k@o1.ingest.sentry.io/1", nodeEnv: "development" }).enabled).toBe(false);
  });

  it("is enabled in production with a DSN and never collects default PII", () => {
    const options = buildSentryOptions({ dsn: "https://k@o1.ingest.sentry.io/1", nodeEnv: "production", vercelEnv: "preview", release: "abc" });
    expect(options).toMatchObject({ enabled: true, environment: "preview", release: "abc", sendDefaultPii: false, tracesSampleRate: 0.1 });
  });

  it("accepts a valid traces sample rate override only", () => {
    expect(buildSentryOptions({ tracesSampleRate: "0.5" }).tracesSampleRate).toBe(0.5);
    expect(buildSentryOptions({ tracesSampleRate: "5" }).tracesSampleRate).toBe(0.1);
  });
});

describe("scrubbing", () => {
  it("redacts e-mails, bearer tokens, JWTs and secret keys", () => {
    const text = scrubText("a@b.com Bearer abc.def eyJhbGciOi.eyJzdWIiOi.sig sk_live_123");
    expect(text).not.toMatch(/a@b\.com|abc\.def|eyJ|sk_live_123/);
  });

  it("drops sensitive headers and keeps only the user id", () => {
    const event = scrubEvent({
      request: { headers: { Authorization: "Bearer x", Cookie: "s=1", Accept: "json" } },
      user: { id: "u1", email: "a@b.com", ip_address: "1.2.3.4" },
      extra: { note: "contact a@b.com" },
    });
    expect(event.request.headers).toEqual({ Authorization: "[redacted]", Cookie: "[redacted]", Accept: "json" });
    expect(event.user).toEqual({ id: "u1" });
    expect(event.extra.note).toBe("contact [redacted-email]");
  });
});
