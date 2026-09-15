import { describe, expect, it } from "vitest";
import type { ErrorEvent } from "@sentry/nextjs";
import {
  buildSentryBaseOptions,
  getSentryEnvironment,
  getTracesSampleRate,
  isSentryEnabled,
  scrubSentryEvent,
} from "../sentryConfig";

const DSN = "https://key@o1.ingest.sentry.io/1";

describe("getSentryEnvironment", () => {
  it("prefers the Vercel environment", () => {
    expect(getSentryEnvironment({ vercelEnv: "preview", nodeEnv: "production" })).toBe("preview");
  });

  it("falls back to NODE_ENV, then development", () => {
    expect(getSentryEnvironment({ nodeEnv: "production" })).toBe("production");
    expect(getSentryEnvironment({})).toBe("development");
  });
});

describe("isSentryEnabled", () => {
  it("is disabled in development even with a DSN", () => {
    expect(isSentryEnabled({ dsn: DSN, nodeEnv: "development" })).toBe(false);
  });

  it("is disabled without a DSN", () => {
    expect(isSentryEnabled({ vercelEnv: "production" })).toBe(false);
  });

  it("is enabled in preview and production with a DSN", () => {
    expect(isSentryEnabled({ dsn: DSN, vercelEnv: "preview" })).toBe(true);
    expect(isSentryEnabled({ dsn: DSN, vercelEnv: "production" })).toBe(true);
  });
});

describe("getTracesSampleRate", () => {
  it("defaults to 0.1", () => {
    expect(getTracesSampleRate({})).toBe(0.1);
  });

  it("is overridable and clamped to [0, 1]", () => {
    expect(getTracesSampleRate({ tracesSampleRate: "0.5" })).toBe(0.5);
    expect(getTracesSampleRate({ tracesSampleRate: "7" })).toBe(1);
    expect(getTracesSampleRate({ tracesSampleRate: "-1" })).toBe(0);
    expect(getTracesSampleRate({ tracesSampleRate: "abc" })).toBe(0.1);
  });
});

describe("buildSentryBaseOptions", () => {
  it("wires dsn, environment, release, sampling and PII settings", () => {
    const options = buildSentryBaseOptions({
      dsn: DSN,
      vercelEnv: "production",
      commitSha: "abc123",
      tracesSampleRate: "0.2",
    });

    expect(options).toMatchObject({
      dsn: DSN,
      enabled: true,
      environment: "production",
      release: "abc123",
      tracesSampleRate: 0.2,
      sendDefaultPii: false,
    });
    expect(options.beforeSend).toBe(scrubSentryEvent);
  });

  it("leaves release undefined when no commit sha is known", () => {
    expect(buildSentryBaseOptions({ dsn: DSN }).release).toBeUndefined();
  });
});

describe("scrubSentryEvent", () => {
  function event(overrides: Partial<ErrorEvent>): ErrorEvent {
    return { type: undefined, ...overrides } as ErrorEvent;
  }

  it("removes user email and ip but keeps the id", () => {
    const scrubbed = scrubSentryEvent(
      event({ user: { id: "u1", email: "bruno@example.com", ip_address: "1.2.3.4" } }),
    );

    expect(scrubbed?.user).toEqual({ id: "u1" });
  });

  it("drops cookies and auth headers from the request", () => {
    const scrubbed = scrubSentryEvent(
      event({
        request: {
          url: "https://stamp.ai/api/x?token=abc",
          cookies: { sb: "session" },
          headers: {
            Cookie: "sb=session",
            Authorization: "Bearer eyJabc.def.ghi",
            "x-request-id": "req_1",
            "content-type": "application/json",
          },
        },
      }),
    );

    expect(scrubbed?.request?.cookies).toBeUndefined();
    expect(scrubbed?.request?.headers).toEqual({
      "x-request-id": "req_1",
      "content-type": "application/json",
    });
    expect(scrubbed?.request?.url).toBe("https://stamp.ai/api/x?token=%5Bredacted%5D");
  });

  it("masks emails and tokens inside messages, exception values and breadcrumbs", () => {
    const scrubbed = scrubSentryEvent(
      event({
        message: "Failed for bruno.afonso@framna.com with Bearer abcdef123456",
        exception: {
          values: [{ type: "Error", value: "jwt eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc-def_ghi" }],
        },
        breadcrumbs: [
          { message: "user@example.com clicked", data: { email: "user@example.com" } },
        ],
      }),
    );

    expect(scrubbed?.message).toBe("Failed for [email] with Bearer [redacted]");
    expect(scrubbed?.exception?.values?.[0].value).toBe("jwt [jwt]");
    expect(scrubbed?.breadcrumbs?.[0].message).toBe("[email] clicked");
    expect(scrubbed?.breadcrumbs?.[0].data).toEqual({ email: "[email]" });
  });

  it("redacts sensitive keys in contexts and extra, recursively", () => {
    const scrubbed = scrubSentryEvent(
      event({
        extra: { password: "hunter2", nested: { apiKey: "sk-live-123", safe: "ok" } },
        contexts: { metadata: { access_token: "t", count: 3 } },
      }),
    );

    expect(scrubbed?.extra).toEqual({
      password: "[redacted]",
      nested: { apiKey: "[redacted]", safe: "ok" },
    });
    expect(scrubbed?.contexts).toEqual({ metadata: { access_token: "[redacted]", count: 3 } });
  });

  it("returns the event untouched when there is nothing to scrub", () => {
    const original = event({ message: "plain", tags: { service: "x" } });

    expect(scrubSentryEvent(original)).toEqual(original);
  });
});
