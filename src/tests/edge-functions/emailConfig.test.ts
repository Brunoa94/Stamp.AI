import { describe, expect, it } from "vitest";
import {
  EmailNotConfiguredError,
  resolveBrevoConfig,
} from "../../../supabase/functions/_shared/emailConfig";

/**
 * Brevo configuration resolution for edge functions. Missing configuration
 * is a hard failure in production (customers would silently get no
 * confirmation/invoice/shipping emails) and a loud warning elsewhere.
 */

const PROD = { SUPABASE_URL: "https://abc.supabase.co" };
const DEV = { SUPABASE_URL: "http://localhost:54321" };

describe("resolveBrevoConfig", () => {
  it("returns the config when fully set", () => {
    expect(
      resolveBrevoConfig({ ...PROD, BREVO_API_KEY: "k", BREVO_FROM_EMAIL: "a@b.co", BREVO_FROM_NAME: "Stamp" }),
    ).toEqual({ status: "ok", apiKey: "k", fromEmail: "a@b.co", fromName: "Stamp" });
  });

  it("falls back to the invoice sender vars and a default name", () => {
    expect(
      resolveBrevoConfig({ ...PROD, BREVO_API_KEY: "k", INVOICE_FROM_EMAIL: "inv@b.co", INVOICE_SELLER_NAME: "Seller" }),
    ).toMatchObject({ status: "ok", fromEmail: "inv@b.co", fromName: "Seller" });
    expect(resolveBrevoConfig({ ...PROD, BREVO_API_KEY: "k", BREVO_FROM_EMAIL: "a@b.co" })).toMatchObject({
      fromName: "Stamp.AI",
    });
  });

  it("throws in production when the API key or sender is missing", () => {
    expect(() => resolveBrevoConfig({ ...PROD })).toThrow(EmailNotConfiguredError);
    expect(() => resolveBrevoConfig({ ...PROD, BREVO_API_KEY: "k" })).toThrow(/BREVO_FROM_EMAIL/);
    expect(() => resolveBrevoConfig({ ...PROD, DENO_ENV: "production" })).toThrow(/BREVO_API_KEY/);
  });

  it("returns a typed skip outside production", () => {
    expect(resolveBrevoConfig({ ...DEV })).toEqual({ status: "skipped", reason: "BREVO_API_KEY is not set" });
    expect(resolveBrevoConfig({ ...DEV, BREVO_API_KEY: "k" })).toEqual({
      status: "skipped",
      reason: "BREVO_FROM_EMAIL (or INVOICE_FROM_EMAIL) is not set",
    });
  });
});
