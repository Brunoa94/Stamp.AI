import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import MollieReturnClient from "./MollieReturnClient";

const mocks = vi.hoisted(() => ({
  getPendingRecoveries: vi.fn(),
  recordPaymentForRecovery: vi.fn(),
  markPaymentRecovered: vi.fn(),
  createOrder: vi.fn(),
  removeCartItems: vi.fn(),
  verifyPayment: vi.fn(),
  createPrintifyOrder: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("payment_id=tr_legacy"),
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/queries/authQueries", () => ({
  useUser: () => ({ data: { id: "user_1" }, isLoading: false }),
}));
vi.mock("@/queries/orderQueries", () => ({
  useCreateOrderFromCart: () => ({ mutateAsync: mocks.createOrder }),
  useUpdateOrderStatus: () => ({ mutateAsync: vi.fn() }),
  useUpdatePaymentStatus: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock("@/queries/cartQueries", () => ({
  useRemoveCartItems: () => ({ mutateAsync: mocks.removeCartItems }),
}));
vi.mock("@/queries/mollieQueries", () => ({
  useVerifyMolliePayment: () => ({ mutateAsync: mocks.verifyPayment }),
}));
vi.mock("@/queries/printifyOrderQueries", () => ({
  useCreatePrintifyOrder: () => ({ mutateAsync: mocks.createPrintifyOrder }),
}));
vi.mock("@/services/paymentRecoveryService", () => ({
  PaymentRecoveryService: mocks,
}));
vi.mock("@/services/orderService", () => ({
  OrderService: {
    getOrderByIdempotencyKey: vi.fn().mockResolvedValue(null),
    linkPaymentTransactionToOrder: vi.fn(),
    getOrder: vi.fn().mockResolvedValue({ order_number: "ORD-1" }),
  },
}));
vi.mock("@/services/cartService", () => ({ CartService: {} }));
vi.mock("@/services/refundService", () => ({ RefundService: {} }));
vi.mock("@/services/invoiceService", () => ({
  InvoiceService: { generateInvoice: vi.fn() },
}));
vi.mock("@/lib/observability/errorCapture", () => ({ captureError: vi.fn() }));
vi.mock("@/features/checkout/ui/PaymentSuccess/PaymentSuccess", () => ({
  default: () => null,
}));
vi.mock("@/features/checkout/ui/components/PaymentError", () => ({
  default: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  // The application uses Next's automatic JSX runtime.
  vi.stubGlobal("React", React);
  mocks.verifyPayment.mockResolvedValue({ status: "paid" });
  mocks.createOrder.mockResolvedValue("order_1");
  mocks.createPrintifyOrder.mockResolvedValue({ success: true });
});

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

it("preserves unselected cart items when recovering a legacy full-cart snapshot", async () => {
  const selected = { id: "selected", is_selected: true, quantity: 1, unit_price: 2500 };
  const unselected = { id: "unselected", is_selected: false, quantity: 1, unit_price: 5000 };
  const snapshot = { id: "cart_1", user_id: "user_1", cart_items: [selected, unselected] };
  mocks.getPendingRecoveries.mockResolvedValue([{
    payment_provider: "mollie",
    payment_intent_id: "tr_legacy",
    amount: 2500,
    cart_snapshot: snapshot,
    line_items: [{ product_id: "product_1", variant_id: 1, quantity: 1 }],
    shipping_address: {
      first_name: "Ada", last_name: "Lovelace", email: "ada@example.com",
      country: "NL", address1: "Dam 1", city: "Amsterdam", zip: "1012JS",
    },
  }]);

  render(<MollieReturnClient />);

  await waitFor(() => expect(mocks.removeCartItems).toHaveBeenCalledWith(["selected"]));
  expect(mocks.createOrder).toHaveBeenCalledWith(expect.objectContaining({
    cart: expect.objectContaining({ cart_items: [selected] }),
  }));
  expect(mocks.recordPaymentForRecovery).toHaveBeenCalledWith(expect.objectContaining({
    cartSnapshot: expect.objectContaining({ cart_items: [selected] }),
  }));
  expect(snapshot.cart_items).toEqual([selected, unselected]);
});
