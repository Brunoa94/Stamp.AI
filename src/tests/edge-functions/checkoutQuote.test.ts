import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), limit: vi.fn(), price: vi.fn() }));
vi.mock("../../../supabase/functions/_shared/validators.ts", () => ({ verifyAuth: mocks.auth }));
vi.mock("../../../supabase/functions/_shared/operationLimit.ts", () => ({ enforceOperationLimit: mocks.limit }));
vi.mock("../../../supabase/functions/_shared/checkoutPricing.ts", () => ({ priceCheckout: mocks.price }));
vi.mock("../../../supabase/functions/_shared/cors.ts", () => ({ corsHeadersFor: () => ({ "Access-Control-Allow-Origin": "https://stamp.ai" }) }));
vi.mock("../../../supabase/functions/_shared/errorReporting.ts", () => ({ reportError: vi.fn() }));
import { checkoutQuoteHandler } from "../../../supabase/functions/_shared/checkoutQuote";
import { FunctionError } from "../../../supabase/functions/_shared/errors";
beforeEach(() => {
  vi.clearAllMocks(); mocks.auth.mockResolvedValue({ userId: "user" });
  mocks.price.mockResolvedValue({ items: [], totalCents: 2499 });
});
const request = () => new Request("https://fixture.test/quote", { method: "POST",
  headers: { Authorization: "Bearer fixture" },
  body: JSON.stringify({ line_items: [{ blueprint_id: 6, variant_id: 101, quantity: 1 }], promo_code: "SAVE10" }),
});
it("authenticates and returns shared pricing without creating a payment", async () => {
  const response = await checkoutQuoteHandler(request());
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(mocks.auth).toHaveBeenCalledWith("Bearer fixture");
  expect(mocks.price).toHaveBeenCalledWith({ lineItems: [{ blueprint_id: 6, variant_id: 101, quantity: 1 }], promoCode: "SAVE10", userId: "user" });
});
it("rejects unauthenticated and service-role calls before pricing", async () => {
  mocks.auth.mockRejectedValueOnce(new FunctionError(401, "UNAUTHORIZED", "No user"));
  expect((await checkoutQuoteHandler(request())).status).toBe(401);
  mocks.auth.mockResolvedValueOnce({ userId: "service-role" });
  expect((await checkoutQuoteHandler(request())).status).toBe(403);
  expect(mocks.price).not.toHaveBeenCalled();
});
it("serves preflight and rejects unsupported methods", async () => {
  expect((await checkoutQuoteHandler(new Request("https://fixture.test", { method: "OPTIONS" }))).status).toBe(204);
  expect((await checkoutQuoteHandler(new Request("https://fixture.test"))).status).toBe(405);
  expect(mocks.auth).not.toHaveBeenCalled();
});
