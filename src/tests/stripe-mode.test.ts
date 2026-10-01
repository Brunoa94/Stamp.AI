import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ supabaseRest: vi.fn() }));
vi.mock("../../supabase/functions/_shared/supabase.ts", () => ({
  supabaseRest: mocks.supabaseRest,
}));
vi.mock("https://esm.sh/stripe@16.12.0?target=deno", () => ({ default: class {} }));

import {
  assertStripeLivemode,
  getStripeSecretKey,
  getStripeWebhookSecret,
  isStripeTestKey,
  resolveStripeMode,
  resolveStripeModeForPaymentIntent,
  stripeModeFromMetadata,
  stripeModeFromUrl,
} from "../../supabase/functions/_shared/stripeConfig.ts";

const env: Record<string, string | undefined> = {};

describe("Stripe mode selection", () => {
  beforeEach(() => {
    for (const key of Object.keys(env)) delete env[key];
    (globalThis as unknown as { Deno: unknown }).Deno = { env: { get: (k: string) => env[k] } };
    mocks.supabaseRest.mockReset();
  });
  afterEach(() => {
    delete (globalThis as { Deno?: unknown }).Deno;
  });

  it.each([
    [true, "test"], ["true", "test"], ["test", "test"],
    [false, "live"], [undefined, "live"], ["no", "live"], [1, "live"],
  ])("resolveStripeMode(%j) -> %s", (input, expected) => {
    expect(resolveStripeMode(input)).toBe(expected);
  });

  it("reads the mode the webhook endpoint was registered with", () => {
    expect(stripeModeFromUrl("https://x.supabase.co/functions/v1/stripe-webhook?mode=test")).toBe("test");
    expect(stripeModeFromUrl("https://x.supabase.co/functions/v1/stripe-webhook")).toBe("live");
  });

  it("reads the mode persisted in payment metadata", () => {
    expect(stripeModeFromMetadata({ stripe_mode: "test" })).toBe("test");
    expect(stripeModeFromMetadata({})).toBe("live");
    expect(stripeModeFromMetadata(null)).toBe("live");
  });

  it("uses the live keys in live mode", () => {
    env.STRIPE_SECRET_KEY = "sk_live";
    env.STRIPE_WEBHOOK_SECRET = "whsec_live";
    env.STRIPE_TEST_SECRET_KEY = "sk_test";
    expect(getStripeSecretKey("live")).toBe("sk_live");
    expect(getStripeWebhookSecret("live")).toBe("whsec_live");
  });

  it("uses the test keys in test mode", () => {
    env.STRIPE_SECRET_KEY = "sk_live";
    env.STRIPE_TEST_SECRET_KEY = "sk_test";
    env.STRIPE_TEST_WEBHOOK_SECRET = "whsec_test";
    expect(getStripeSecretKey("test")).toBe("sk_test");
    expect(getStripeWebhookSecret("test")).toBe("whsec_test");
  });

  it("never falls back to live keys when test keys are missing", () => {
    env.STRIPE_SECRET_KEY = "sk_live";
    env.STRIPE_WEBHOOK_SECRET = "whsec_live";
    expect(() => getStripeSecretKey("test")).toThrow(/STRIPE_TEST_SECRET_KEY/);
    expect(() => getStripeWebhookSecret("test")).toThrow(/STRIPE_TEST_WEBHOOK_SECRET/);
  });

  it("rejects events whose livemode does not match the key type", () => {
    expect(() => assertStripeLivemode("sk_live_abc", true)).not.toThrow();
    expect(() => assertStripeLivemode("sk_test_abc", false)).not.toThrow();
    expect(() => assertStripeLivemode("rk_test_abc", false)).not.toThrow();
    expect(() => assertStripeLivemode("sk_live_abc", false)).toThrow(/mode/);
    expect(() => assertStripeLivemode("sk_test_abc", true)).toThrow(/mode/);
  });

  it("identifies test keys by prefix", () => {
    expect(isStripeTestKey("sk_test_abc")).toBe(true);
    expect(isStripeTestKey("rk_test_abc")).toBe(true);
    expect(isStripeTestKey("sk_live_abc")).toBe(false);
  });

  it("resolves a stored payment's mode from its payment_transactions row", async () => {
    mocks.supabaseRest.mockResolvedValue({ data: [{ metadata: { stripe_mode: "test" } }], error: null, status: 200 });
    await expect(resolveStripeModeForPaymentIntent("pi_1")).resolves.toBe("test");
    expect(mocks.supabaseRest).toHaveBeenCalledWith(
      expect.stringContaining("stripe_payment_intent_id=eq.pi_1"),
      "GET",
    );
  });

  it("defaults an unknown or unreadable payment to live", async () => {
    mocks.supabaseRest.mockResolvedValueOnce({ data: [], error: null, status: 200 });
    await expect(resolveStripeModeForPaymentIntent("pi_2")).resolves.toBe("live");
    mocks.supabaseRest.mockResolvedValueOnce({ data: null, error: { message: "boom" }, status: 500 });
    await expect(resolveStripeModeForPaymentIntent("pi_3")).resolves.toBe("live");
  });
});
