import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/i18n/messages/en.json";
import type { CartWithItems } from "@/shared/types/cart";

const mocks = vi.hoisted(() => ({ pricing: {} as Record<string, unknown>, method: "paypal",
  paypal: vi.fn(), ideal: vi.fn(), stripe: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("react-hook-form", () => ({ useFormContext: () => ({
  watch: (key: string) => key === "paymentMethod" ? mocks.method : key === "billing" ? { first_name: "Test" } : undefined,
  formState: { isValid: true }, getValues: () => ({ paymentMethod: mocks.method }),
}) }));
vi.mock("@/features/checkout/lib/hooks/useCheckoutPricing", () => ({ useCheckoutPricing: () => mocks.pricing }));
vi.mock("@stripe/react-stripe-js", () => ({ Elements: ({ children }: { children: React.ReactNode }) => children }));
vi.mock("@/lib/stripe", () => ({ getStripePromise: () => null }));
vi.mock("@/features/checkout/ui/PaymentForm/usePaymentForm", () => ({ usePaymentForm: () => ({
  loading: false, error: null, handleSubmit: mocks.stripe, setSelectedTestMethod: vi.fn(),
}) }));
vi.mock("@/features/checkout/lib/queries/paymentQueries", () => ({
  usePreparePayPalPayment: () => ({ mutateAsync: mocks.paypal, isPending: false }),
  usePrepareIdealPayment: () => ({ mutateAsync: mocks.ideal, isPending: false }),
}));
vi.mock("@/features/checkout/lib/mappers/printifyLineItemsMapper", () => ({ buildPrintifyLineItems: () => [{ product_id: "abc123", variant_id: 101, quantity: 1 }] }));
import { CheckoutSummarySection } from "./CheckoutSummarySection";

const cart = { id: "cart", cart_items: [{ id: "item", product_id: "abc123", variant_id: "101",
  quantity: 1, unit_price: 2000, regular_price_cents: 3000, product_name: "Launch Tee" }] } as CartWithItems;
const initialQuote = { items: [{ unitPriceCents: 2000 }], totalCents: 2499, discountCents: 0, shippingCents: 499 };
function show() {
  return render(<NextIntlClientProvider locale="en" messages={messages}>
    <CheckoutSummarySection cart={cart} />
  </NextIntlClientProvider>);
}
beforeEach(() => {
  cleanup(); vi.clearAllMocks();
  mocks.method = "paypal";
  mocks.pricing = { quotedCart: cart, quote: initialQuote, subtotal: 20, shipping: 4.99,
    discount: 0, total: 24.99, totalInCents: 2499, isPricing: false,
    pricingUnavailable: false, isApplyingPromo: false, refreshPricing: mocks.refresh,
    applyPromoCode: vi.fn(), clearPromoCode: vi.fn() };
  mocks.refresh.mockResolvedValue({ data: initialQuote });
  mocks.paypal.mockResolvedValue({ approvalUrl: "#paid" });
  mocks.ideal.mockResolvedValue({ checkoutUrl: "#paid" });
});

describe("payment quote preflight", () => {
  it.each(["paypal", "ideal", "stripe"])("requires another explicit %s action when prices change", async (method) => {
    mocks.method = method;
    const updated = { ...initialQuote, items: [{ unitPriceCents: 3000 }], totalCents: 3499 };
    mocks.refresh.mockImplementationOnce(async () => {
      mocks.pricing = { ...mocks.pricing, quote: updated, total: 34.99, totalInCents: 3499,
        subtotal: 30, quotedCart: { ...cart, cart_items: [{ ...cart.cart_items[0], unit_price: 3000 }] } };
      return { data: updated };
    }).mockResolvedValue({ data: updated });
    show();
    const paymentButton = screen.getAllByRole("button").at(-1)!;
    fireEvent.click(paymentButton);
    await screen.findByText(messages.promotions.pricingChanged);
    expect(mocks.paypal).not.toHaveBeenCalled();
    expect(mocks.ideal).not.toHaveBeenCalled();
    expect(mocks.stripe).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button").at(-1)!);
    await waitFor(() => expect(mocks[method as "paypal" | "ideal" | "stripe"]).toHaveBeenCalledTimes(1));
    if (method !== "stripe") expect(mocks[method as "paypal" | "ideal"].mock.calls[0][0].amount).toBe(3499);
  });
  it.each(["isPricing", "pricingUnavailable", "isApplyingPromo"])("blocks payment when %s", (state) => {
    mocks.pricing[state] = true;
    show();
    expect(screen.getAllByRole("button").at(-1)).toBeDisabled();
    expect(mocks.paypal).not.toHaveBeenCalled();
  });
  it("does not create a payment when refreshing the quote fails", async () => {
    mocks.refresh.mockResolvedValue({ error: new Error("offline") });
    show(); fireEvent.click(screen.getAllByRole("button").at(-1)!);
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalled());
    expect(mocks.paypal).not.toHaveBeenCalled();
  });
  it("refreshes prices after a provider rejects a stale total without retrying payment", async () => {
    mocks.paypal.mockRejectedValue(new Error("PRICE_MISMATCH"));
    mocks.refresh.mockResolvedValueOnce({ data: initialQuote }).mockResolvedValueOnce({
      data: { ...initialQuote, totalCents: 3499, items: [{ unitPriceCents: 3000 }] },
    });
    show(); fireEvent.click(screen.getAllByRole("button").at(-1)!);
    await screen.findByText(messages.promotions.pricingChanged);
    expect(mocks.refresh).toHaveBeenCalledTimes(2);
    expect(mocks.paypal).toHaveBeenCalledTimes(1);
  });
});
