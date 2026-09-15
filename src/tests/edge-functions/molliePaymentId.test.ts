// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isValidMolliePaymentId } from "../../../supabase/functions/_shared/molliePaymentId";

/**
 * mollie-webhook receives only a payment id and re-fetches the payment from
 * Mollie. The id is interpolated into the Mollie API path and stored as the
 * webhook event id, so it must be a well-formed Mollie payment id.
 */
describe("isValidMolliePaymentId", () => {
  it.each(["tr_WDqYK6vllg", "tr_7UhSN1zuXS", "tr_abc123XYZ0"])(
    "accepts a well-formed id %s",
    (id) => {
      expect(isValidMolliePaymentId(id)).toBe(true);
    },
  );

  it.each([
    "",
    "tr_",
    "WDqYK6vllg",
    "tr_WDqYK6vllg/../refunds",
    "tr_WDqYK6vllg?x=1",
    "tr_WDqY K6vllg",
    "re_4qqhO89gsT",
    "tr_" + "a".repeat(64),
  ])("rejects a malformed id %j", (id) => {
    expect(isValidMolliePaymentId(id)).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(isValidMolliePaymentId(null)).toBe(false);
    expect(isValidMolliePaymentId(undefined)).toBe(false);
    expect(isValidMolliePaymentId(42)).toBe(false);
  });
});
