import { buildRefundFulfillmentMessages } from "../helpers/fulfillmentMessages";
import type { CheckoutData } from "./checkoutStorageService";
import type {
  FulfillOrderT,
  OrderFulfillmentResultI,
  PaymentReturnProviderT,
  PaymentReturnTranslatorT,
} from "../types/paymentReturn";
import { CartService } from "@/shared/services/cartService";
import { validatePrintifyLineItem } from "@/shared/types/printifyOrder";
import type { UserI } from "@/supabase/types";

interface StoredCheckoutFulfillmentI {
  provider: Extract<PaymentReturnProviderT, "stripe" | "paypal">;
  paymentId: string;
  refundReference: string | null;
  checkoutData: CheckoutData;
  cartId: string;
  user: UserI;
  t: PaymentReturnTranslatorT;
  fulfillOrder: FulfillOrderT;
  metadata?: Record<string, string | undefined>;
  recoveryMetadata?: Record<string, string | undefined>;
}

/**
 * Fulfill an order from the checkout data Stripe and PayPal persist in
 * localStorage before redirecting the customer to the provider.
 */
export async function fulfillStoredCheckout({
  provider,
  paymentId,
  refundReference,
  checkoutData,
  cartId,
  user,
  t,
  fulfillOrder,
  metadata,
  recoveryMetadata,
}: StoredCheckoutFulfillmentI): Promise<OrderFulfillmentResultI> {
  // New checkouts carry an immutable snapshot. The live-cart fallback
  // only supports sessions that were already in flight at deployment.
  const cartSnapshot =
    checkoutData.cartSnapshot ?? (await CartService.getCheckoutCart(cartId));

  return fulfillOrder({
    provider,
    paymentId,
    refundReference,
    user,
    cartSnapshot,
    lineItems: checkoutData.lineItems.map(validatePrintifyLineItem),
    shippingAddress: checkoutData.shippingAddress,
    billingAddress: checkoutData.billing,
    amount: checkoutData.amount ?? 0,
    currency: "USD",
    shippingCostCents: checkoutData.shippingCostCents,
    discountCents: checkoutData.discountCents,
    metadata,
    recoveryMetadata,
    messages: buildRefundFulfillmentMessages(t),
  });
}
