// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as fetchProduct } from "@/app/api/fetch-custom-product/route";
import { GET as callback } from "@/app/auth/callback/route";
import { POST as capture } from "@/app/api/paypal/capture-order/route";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), exchange: vi.fn(), getOrder: vi.fn(), capture: vi.fn(), rpc: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => ({
  auth: { getUser: mocks.getUser }, rpc: mocks.rpc,
  from: () => ({ update: () => ({ eq: vi.fn() }) }),
}) }));
vi.mock("@supabase/ssr", () => ({ createServerClient: () => ({
  auth: { exchangeCodeForSession: mocks.exchange },
}) }));
vi.mock("@/lib/paypal-server", () => ({
  getPayPalOrder: mocks.getOrder, capturePayPalOrder: mocks.capture,
  PayPalCaptureError: class extends Error {},
}));
vi.mock("@/lib/observability/errorCapture", () => ({ captureError: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: "owner" } } });
  mocks.exchange.mockResolvedValue({ error: null });
  mocks.rpc.mockResolvedValue({ data: {}, error: null });
});

describe("Product lookup", () => {
  it("fetches a valid Printify shop product", async () => {
    const id = "5d39b159e7c48c000728c89f";
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id })));
    try {
      const response = await fetchProduct(new NextRequest(`https://stamp.test/api/fetch-custom-product?product_id=${id}`));
      expect(response.status).toBe(200);
      expect(fetch.mock.calls[0][0]).toContain(`/products/${id}.json`);
    } finally { fetch.mockRestore(); }
  });
  it.each(["123", "../orders", "5d39b159e7c48c000728c89f/../../orders", ""])("rejects invalid ID %s", async (id) => {
    const response = await fetchProduct(new NextRequest(`https://stamp.test/api/fetch-custom-product?product_id=${encodeURIComponent(id)}`));
    expect(response.status).toBe(400);
  });
});

describe("Callback destination after successful code exchange", () => {
  it.each(["/\\evil.example.com", "//evil.example.com", "https://evil.example.com", "/\t/evil.example.com", "//[invalid"])("rejects %s", async (next) => {
    const response = await callback(new NextRequest(`https://stamp.test/auth/callback?code=valid&next=${encodeURIComponent(next)}`));
    expect(mocks.exchange).toHaveBeenCalledWith("valid");
    expect(response.headers.get("location")).toBe("https://stamp.test/stamp");
  });
  it("preserves local paths, queries, and fragments", async () => {
    const response = await callback(new NextRequest("https://stamp.test/auth/callback?code=valid&next=" + encodeURIComponent("/orders?tab=paid#latest")));
    expect(response.headers.get("location")).toBe("https://stamp.test/orders?tab=paid#latest");
  });
});

describe("PayPal capture ownership", () => {
  const request = () => new NextRequest("https://stamp.test/api/paypal/capture-order", {
    method: "POST", body: JSON.stringify({ orderId: "ORDER123" }),
  });
  it.each([undefined, "{}", "null", "invalid", JSON.stringify({ user_id: "other" })])("rejects missing or foreign ownership (%s) before capture", async (custom_id) => {
    mocks.getOrder.mockResolvedValue({ purchase_units: [{ custom_id }] });
    expect((await capture(request())).status).toBe(403);
    expect(mocks.capture).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("fails closed when there are no purchase units", async () => {
    mocks.getOrder.mockResolvedValue({});
    expect((await capture(request())).status).toBe(403);
    expect(mocks.capture).not.toHaveBeenCalled();
  });
  it("captures an owned order only after checking the provider", async () => {
    const purchase_units = [{ custom_id: JSON.stringify({ user_id: "owner" }), payments: { captures: [{ id: "CAPTURE1", amount: { value: "10.00", currency_code: "USD" } }] } }];
    mocks.getOrder.mockResolvedValue({ purchase_units });
    mocks.capture.mockResolvedValue({ status: "COMPLETED", purchase_units });
    expect((await capture(request())).status).toBe(200);
    expect(mocks.getOrder.mock.invocationCallOrder[0]).toBeLessThan(mocks.capture.mock.invocationCallOrder[0]);
  });
});
