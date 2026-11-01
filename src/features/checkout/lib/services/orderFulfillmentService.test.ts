import { beforeEach, describe, expect, it, vi } from "vitest";
import { fulfillPaidOrder } from "./orderFulfillmentService";
import { UserFacingError } from "@/shared/errors/UserFacingError";
import type {
  OrderFulfillmentDepsI,
  OrderFulfillmentRequestI,
} from "../types/paymentReturn";

const mocks = vi.hoisted(() => ({
  getOrderByIdempotencyKey: vi.fn(),
  getOrder: vi.fn(),
  updateOrder: vi.fn(),
  processRefund: vi.fn(),
  recordPaymentForRecovery: vi.fn(),
  markPaymentRecovered: vi.fn(),
  generateInvoice: vi.fn(),
}));

vi.mock("@/shared/services/orderService", () => ({ OrderService: mocks }));
vi.mock("@/shared/services/refundService", () => ({ RefundService: mocks }));
vi.mock("@/shared/services/paymentRecoveryService", () => ({
  PaymentRecoveryService: mocks,
}));
vi.mock("@/shared/services/invoiceService", () => ({ InvoiceService: mocks }));
vi.mock("@/lib/observability/errorCapture", () => ({ captureError: vi.fn() }));
vi.mock("@/shared/mappers/mapShippingAddressToPrintifyAddress", () => ({
  mapShippingAddressToPrintifyAddress: vi.fn(() => ({})),
}));

const buildDeps = (): OrderFulfillmentDepsI => ({
  createOrderFromCart: vi.fn().mockResolvedValue("order_1"),
  createPrintifyOrder: vi
    .fn()
    .mockResolvedValue({ success: true, order: { id: "printify_1" } }),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  removeCartItems: vi.fn().mockResolvedValue(undefined),
});

const buildRequest = (
  overrides: Partial<OrderFulfillmentRequestI> = {},
): OrderFulfillmentRequestI =>
  ({
    provider: "mollie",
    paymentId: "tr_1",
    refundReference: "tr_1",
    user: { id: "user_1" },
    cartSnapshot: { id: "cart_1", cart_items: [{ id: "item_1" }] },
    lineItems: [],
    shippingAddress: {},
    amount: 2500,
    currency: "EUR",
    messages: {
      orderCreationFailed: () => "creation failed",
      orderIdMissing: "id missing",
      fulfillmentFailed: () => "fulfillment failed",
    },
    ...overrides,
  }) as OrderFulfillmentRequestI;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getOrderByIdempotencyKey.mockResolvedValue(null);
  mocks.getOrder.mockResolvedValue({ order_number: "ORD-1" });
});

describe("fulfillPaidOrder", () => {
  it("returns the existing order without creating a duplicate", async () => {
    mocks.getOrderByIdempotencyKey.mockResolvedValue({
      order_number: "ORD-9",
      payment_status: "paid",
      status: "confirmed",
      printify_order_id: "printify_9",
    });
    const deps = buildDeps();

    await expect(fulfillPaidOrder(deps, buildRequest())).resolves.toEqual({
      orderNumber: "ORD-9",
    });
    expect(mocks.getOrderByIdempotencyKey).toHaveBeenCalledWith("mollie_tr_1");
    expect(deps.createOrderFromCart).not.toHaveBeenCalled();
  });

  it("runs every stage and removes only the ordered cart items", async () => {
    const deps = buildDeps();

    await expect(
      fulfillPaidOrder(deps, buildRequest({ generateInvoice: true })),
    ).resolves.toEqual({ orderNumber: "ORD-1" });
    expect(deps.createOrderFromCart).toHaveBeenCalledWith({
      provider: "mollie",
      paymentId: "tr_1",
      cart: expect.objectContaining({ id: "cart_1" }),
      shippingAddress: {},
      billingAddress: undefined,
    });
    // create-printify-order links the Printify order server-side.
    expect(mocks.updateOrder).not.toHaveBeenCalled();
    expect(mocks.markPaymentRecovered).toHaveBeenCalledWith(
      "tr_1",
      "mollie",
      "order_1",
    );
    expect(mocks.generateInvoice).toHaveBeenCalledWith("order_1");
    expect(deps.removeCartItems).toHaveBeenCalledWith(["item_1"]);
    expect(mocks.processRefund).not.toHaveBeenCalled();
  });

  it("marks the order failed and refunds against the real order when Printify fails", async () => {
    const deps = buildDeps();
    vi.mocked(deps.createPrintifyOrder).mockRejectedValue(new Error("down"));

    await expect(fulfillPaidOrder(deps, buildRequest())).rejects.toEqual(
      new UserFacingError("fulfillment failed"),
    );
    expect(deps.updateOrderStatus).toHaveBeenCalledWith({
      orderId: "order_1",
      status: "unsuccessful_confirmation",
    });
    expect(mocks.processRefund).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order_1",
        paymentProvider: "mollie",
        molliePaymentId: "tr_1",
        amount: 2500,
      }),
    );
  });

  it("fulfils a paid order the webhook created before the return page", async () => {
    mocks.getOrderByIdempotencyKey.mockResolvedValue({
      order_number: "ORD-7",
      payment_status: "paid",
      status: "confirmed",
      printify_order_id: null,
    });
    const deps = buildDeps();

    await fulfillPaidOrder(deps, buildRequest());
    expect(deps.createOrderFromCart).toHaveBeenCalled();
    expect(deps.createPrintifyOrder).toHaveBeenCalled();
  });

  it("does not refund when the order was already sent to Printify", async () => {
    const deps = buildDeps();
    vi.mocked(deps.createPrintifyOrder).mockRejectedValue(
      Object.assign(new Error("dup"), { code: "ALREADY_FULFILLED" }),
    );

    await expect(fulfillPaidOrder(deps, buildRequest())).resolves.toEqual({
      orderNumber: "ORD-1",
    });
    expect(deps.updateOrderStatus).not.toHaveBeenCalled();
    expect(mocks.processRefund).not.toHaveBeenCalled();
  });

  it("refunds with a temporary reference when the order was never created", async () => {
    const deps = buildDeps();
    vi.mocked(deps.createOrderFromCart).mockRejectedValue(new Error("db"));

    await expect(
      fulfillPaidOrder(
        deps,
        buildRequest({ provider: "paypal", refundReference: "capture_1" }),
      ),
    ).rejects.toEqual(new UserFacingError("creation failed"));
    expect(mocks.processRefund).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "temp_paypal_tr_1",
        paypalCaptureId: "capture_1",
      }),
    );
  });
});
