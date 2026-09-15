// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  finalizePaidOrder,
  type FinalizeOrderPortsI,
  type FinalizeOrderRequestI,
} from "../../../supabase/functions/_shared/finalizePaidOrder";
import { DEFAULT_ORDER_TOTALS_CONFIG, calculateOrderTotals } from "../../../supabase/functions/_shared/orderTotals";
import { FunctionError } from "../../../supabase/functions/_shared/errors";

/**
 * finalizePaidOrder is the single server-side path that turns a verified
 * payment into a paid order. I/O is injected so the decision flow can be
 * tested without Deno or a database.
 */

const cartItems = [
  {
    id: "item_1",
    product_id: "prod_1",
    product_name: "Tee",
    variant_id: "4012",
    quantity: 1,
    unit_price: 1, // client price is ignored
    printify_blueprint_id: 145,
    custom_image_url: "https://img/1.png",
  },
];

function buildPorts(overrides: Partial<FinalizeOrderPortsI> = {}): FinalizeOrderPortsI {
  const totals = calculateOrderTotals({ subtotalCents: 2500, discountCents: 0 }); // 29.99
  return {
    config: DEFAULT_ORDER_TOTALS_CONFIG,
    verifyPayment: vi.fn().mockResolvedValue({ amount: 29.99, currency: "EUR", userId: "user_1" }),
    priceOrder: vi.fn().mockResolvedValue({
      pricing: {
        success: true,
        subtotal_cents: 2500,
        errors: [],
        items: [{ blueprint_id: 145, printify_variant_id: 4012, quantity: 1, unit_price_cents: 2500, total_cents: 2500, product_name: "Heavy Cotton Tee" }],
      },
      promo: null,
      totals,
    }),
    loadStoredPromoCode: vi.fn().mockResolvedValue(null),
    findOrderByIdempotencyKey: vi.fn().mockResolvedValue(null),
    insertOrder: vi.fn().mockResolvedValue({ id: "order_1", order_number: "ORD-1" }),
    insertOrderItems: vi.fn().mockResolvedValue(undefined),
    recordPaymentTransaction: vi.fn().mockResolvedValue(undefined),
    now: () => 1700000000000,
    random: () => 0.5,
    ...overrides,
  };
}

const request: FinalizeOrderRequestI = {
  provider: "stripe",
  paymentId: "pi_123",
  caller: { userId: "user_1", userEmail: "user@example.com", isServiceRole: false },
  source: { cartItems },
  shippingAddress: { first_name: "Jane", last_name: "Doe", email: "jane@example.com" },
  billingAddress: null,
};

describe("finalizePaidOrder", () => {
  let ports: FinalizeOrderPortsI;

  beforeEach(() => {
    ports = buildPorts();
  });

  it("verifies the payment, reprices from the catalog and mints a paid order", async () => {
    const result = await finalizePaidOrder(request, ports);

    expect(result).toEqual({ orderId: "order_1", orderNumber: "ORD-1", created: true, totalCents: 2999 });
    expect(ports.verifyPayment).toHaveBeenCalledWith("stripe", "pi_123", "user_1");
    expect(ports.priceOrder).toHaveBeenCalledWith({
      lineItems: [{ blueprint_id: 145, printify_variant_id: 4012, quantity: 1 }],
      promoCode: null,
      config: DEFAULT_ORDER_TOTALS_CONFIG,
    });
    expect(ports.insertOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user_1",
        payment_status: "paid",
        status: "pending",
        total_amount: 2999,
        subtotal: 2500,
        shipping_cost: 499,
        idempotency_key: "stripe_pi_123",
        payment_method: "stripe",
        currency: "EUR",
      }),
    );
    expect(ports.insertOrderItems).toHaveBeenCalledWith([
      expect.objectContaining({ order_id: "order_1", product_id: "prod_1", unit_price: 2500, total_price: 2500, product_name: "Tee" }),
    ]);
    expect(ports.recordPaymentTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "stripe", paymentId: "pi_123", orderId: "order_1", userId: "user_1", amount: 29.99, currency: "EUR" }),
    );
  });

  it("returns the existing order for a repeated payment id without touching the provider", async () => {
    vi.mocked(ports.findOrderByIdempotencyKey).mockResolvedValue({ id: "order_9", order_number: "ORD-9", user_id: "user_1", payment_status: "paid" });

    const result = await finalizePaidOrder(request, ports);

    expect(result).toEqual({ orderId: "order_9", orderNumber: "ORD-9", created: false, totalCents: null });
    expect(ports.verifyPayment).not.toHaveBeenCalled();
    expect(ports.insertOrder).not.toHaveBeenCalled();
  });

  it("refuses to return another user's order for the same payment id", async () => {
    vi.mocked(ports.findOrderByIdempotencyKey).mockResolvedValue({ id: "order_9", order_number: "ORD-9", user_id: "user_2", payment_status: "paid" });
    await expect(finalizePaidOrder(request, ports)).rejects.toMatchObject({ status: 403 });
  });

  it("rejects when the charged amount differs from the server total", async () => {
    vi.mocked(ports.verifyPayment).mockResolvedValue({ amount: 25, currency: "EUR", userId: "user_1" });
    await expect(finalizePaidOrder(request, ports)).rejects.toMatchObject({ errorId: "AMOUNT_MISMATCH", status: 402 });
    expect(ports.insertOrder).not.toHaveBeenCalled();
  });

  it("rejects when the charged currency differs", async () => {
    vi.mocked(ports.verifyPayment).mockResolvedValue({ amount: 29.99, currency: "USD", userId: "user_1" });
    await expect(finalizePaidOrder(request, ports)).rejects.toMatchObject({ errorId: "CURRENCY_MISMATCH" });
  });

  it("propagates payment verification failures", async () => {
    vi.mocked(ports.verifyPayment).mockRejectedValue(new FunctionError(402, "PAYMENT_NOT_COMPLETED", "nope"));
    await expect(finalizePaidOrder(request, ports)).rejects.toMatchObject({ errorId: "PAYMENT_NOT_COMPLETED" });
    expect(ports.priceOrder).not.toHaveBeenCalled();
  });

  it("rejects an order source with no priceable items", async () => {
    await expect(
      finalizePaidOrder({ ...request, source: { cartItems: [{ ...cartItems[0], is_selected: false }] } }, ports),
    ).rejects.toMatchObject({ errorId: "INVALID_ORDER_SOURCE", status: 400 });
    expect(ports.verifyPayment).not.toHaveBeenCalled();
  });

  it("uses the promo code stored with the payment when the caller sends none", async () => {
    vi.mocked(ports.loadStoredPromoCode).mockResolvedValue("SAVE10");
    await finalizePaidOrder(request, ports);
    expect(ports.priceOrder).toHaveBeenCalledWith(expect.objectContaining({ promoCode: "SAVE10" }));
  });

  it("prefers the caller's promo code and normalises it", async () => {
    vi.mocked(ports.loadStoredPromoCode).mockResolvedValue("OTHER");
    await finalizePaidOrder({ ...request, promoCode: " save10 " }, ports);
    expect(ports.priceOrder).toHaveBeenCalledWith(expect.objectContaining({ promoCode: "SAVE10" }));
    expect(ports.loadStoredPromoCode).not.toHaveBeenCalled();
  });

  it("resolves a concurrent insert conflict by returning the winner", async () => {
    vi.mocked(ports.insertOrder).mockResolvedValue(null);
    vi.mocked(ports.findOrderByIdempotencyKey)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "order_w", order_number: "ORD-W", user_id: "user_1", payment_status: "paid" });

    const result = await finalizePaidOrder(request, ports);
    expect(result).toEqual({ orderId: "order_w", orderNumber: "ORD-W", created: false, totalCents: null });
    expect(ports.insertOrderItems).not.toHaveBeenCalled();
  });

  it("lets the service role finalize on behalf of the payment owner", async () => {
    const serviceRequest: FinalizeOrderRequestI = {
      ...request,
      caller: { userId: "service-role", userEmail: "service@system.internal", isServiceRole: true },
      owner: { userId: "user_1", userEmail: "owner@example.com" },
    };
    await finalizePaidOrder(serviceRequest, ports);
    expect(ports.verifyPayment).toHaveBeenCalledWith("stripe", "pi_123", "user_1");
    expect(ports.insertOrder).toHaveBeenCalledWith(expect.objectContaining({ user_id: "user_1" }));
  });

  it("requires an owner when the service role calls", async () => {
    await expect(
      finalizePaidOrder(
        { ...request, caller: { userId: "service-role", userEmail: "", isServiceRole: true } },
        ports,
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
});
