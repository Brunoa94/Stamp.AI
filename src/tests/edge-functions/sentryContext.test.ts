import { describe, expect, it } from "vitest";
import {
  buildErrorContext,
  CRON_MONITORS,
  getCronMonitor,
  getRequestIdFromHeaders,
  normalizeError,
  resolveEdgeEnvironment,
  scrubContext,
} from "../../../supabase/functions/_shared/sentryContext";

/**
 * Pure helpers behind supabase/functions/_shared/sentry.ts. The Deno Sentry
 * SDK cannot run under vitest, so everything that decides WHAT is reported
 * (tags, contexts, PII scrubbing, cron monitor slugs) lives here and is
 * tested directly.
 */

describe("resolveEdgeEnvironment", () => {
  it("prefers an explicit SENTRY_ENVIRONMENT", () => {
    expect(resolveEdgeEnvironment({ SENTRY_ENVIRONMENT: "staging", DENO_ENV: "production" })).toBe(
      "staging",
    );
  });

  it("uses DENO_ENV / ENVIRONMENT next", () => {
    expect(resolveEdgeEnvironment({ DENO_ENV: "production" })).toBe("production");
    expect(resolveEdgeEnvironment({ ENVIRONMENT: "preview" })).toBe("preview");
  });

  it("infers production from a hosted Supabase URL, development otherwise", () => {
    expect(resolveEdgeEnvironment({ SUPABASE_URL: "https://abc.supabase.co" })).toBe("production");
    expect(resolveEdgeEnvironment({ SUPABASE_URL: "http://localhost:54321" })).toBe("development");
    expect(resolveEdgeEnvironment({})).toBe("development");
  });
});

describe("getRequestIdFromHeaders", () => {
  it("reads x-request-id, then sb-request-id", () => {
    expect(getRequestIdFromHeaders(new Headers({ "x-request-id": "req_a" }))).toBe("req_a");
    expect(getRequestIdFromHeaders(new Headers({ "sb-request-id": "sb_b" }))).toBe("sb_b");
  });

  it("generates an id when none is present", () => {
    expect(getRequestIdFromHeaders(new Headers())).toMatch(/^req_[a-z0-9]+_[a-z0-9]+$/);
  });
});

describe("scrubContext", () => {
  it("masks emails and tokens in strings and redacts sensitive keys recursively", () => {
    expect(
      scrubContext({
        customer: "bruno@example.com",
        note: "Authorization: Bearer abc.def",
        apiKey: "sk_live_1234567890",
        nested: { password: "x", order_id: "o1", jwt: "eyJa.eyJb.sig" },
        list: ["a@b.co", 3],
      }),
    ).toEqual({
      customer: "[email]",
      note: "Authorization: Bearer [redacted]",
      apiKey: "[redacted]",
      nested: { password: "[redacted]", order_id: "o1", jwt: "[jwt]" },
      list: ["[email]", 3],
    });
  });

  it("returns an empty object for undefined input", () => {
    expect(scrubContext(undefined)).toEqual({});
  });
});

describe("buildErrorContext", () => {
  it("tags the function and request id and records only method + path", () => {
    const context = buildErrorContext({
      functionName: "stripe-webhook",
      requestId: "req_1",
      request: new Request("https://x.supabase.co/functions/v1/stripe-webhook?token=abc", {
        method: "POST",
        headers: { authorization: "Bearer secret", cookie: "a=b" },
      }),
      extra: { order_id: "o1", email: "a@b.co" },
    });

    expect(context).toEqual({
      tags: { function: "stripe-webhook", request_id: "req_1" },
      contexts: {
        request: { method: "POST", path: "/functions/v1/stripe-webhook" },
      },
      extra: { order_id: "o1", email: "[email]" },
    });
    expect(JSON.stringify(context)).not.toContain("secret");
    expect(JSON.stringify(context)).not.toContain("token=abc");
  });

  it("works without a request", () => {
    expect(buildErrorContext({ functionName: "cron" })).toEqual({
      tags: { function: "cron" },
      contexts: {},
      extra: {},
    });
  });
});

describe("normalizeError", () => {
  it("passes Error instances through and wraps everything else", () => {
    const error = new Error("boom");
    expect(normalizeError(error)).toBe(error);
    expect(normalizeError("string failure")).toBeInstanceOf(Error);
    expect(normalizeError("string failure").message).toBe("string failure");
    expect(normalizeError({ code: 1 }).message).toBe('{"code":1}');
  });
});

describe("cron monitors", () => {
  it("defines a monitor for every pg_cron-invoked function with its schedule", () => {
    expect(CRON_MONITORS["sync-printify-orders"]).toEqual({
      slug: "edge-sync-printify-orders",
      crontab: "0 */4 * * *",
      maxRuntimeMinutes: 10,
    });
    expect(CRON_MONITORS["sync-cheapest-providers"]).toEqual({
      slug: "edge-sync-cheapest-providers",
      crontab: "0 3 * * *",
      maxRuntimeMinutes: 30,
    });
  });

  it("returns null for functions that are not cron-invoked", () => {
    expect(getCronMonitor("process-payment-recovery")).toBeNull();
    expect(getCronMonitor("stripe-webhook")).toBeNull();
  });

  it("uses unique slugs", () => {
    const slugs = Object.values(CRON_MONITORS).map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
