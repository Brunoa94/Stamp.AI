import { PAYMENT_RETURN_SERVICE_NAME } from "../constants/paymentReturn";
import { UserFacingError } from "../errors/UserFacingError";
import type { PaymentReturnTranslatorT } from "../types/paymentReturn";
import {
  CheckoutStorageService,
  type MollieCheckoutSessionData,
} from "./checkoutStorageService";
import { captureError } from "@/lib/observability/errorCapture";
import { CartServiceMapper } from "@/shared/mappers/services/cartServiceMapper";
import type { ShippingAddressT } from "@/shared/schemas/checkout";
import { CartService } from "@/shared/services/cartService";
import { PaymentRecoveryService } from "@/shared/services/paymentRecoveryService";
import type { CartWithItems } from "@/shared/types/cart";
import {
  validatePrintifyLineItem,
  type PrintifyLineItem,
} from "@/shared/types/printifyOrder";

export interface MollieOrderContextI {
  cartSnapshot: CartWithItems;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  amount: number;
  shippingCostCents?: number;
  discountCents?: number;
}

const isIncomplete = (data: MollieCheckoutSessionData) =>
  !data.paymentId ||
  !data.lineItems ||
  !data.shippingAddress ||
  !data.cartSnapshot;

/**
 * Resolve the Mollie checkout session saved before the redirect. When
 * sessionStorage was lost (new tab, browser restart), fall back to the
 * pending payment-recovery record stored in the database.
 */
export async function resolveMollieCheckoutSession(
  paymentIdFromUrl: string | null,
): Promise<MollieCheckoutSessionData> {
  const stored = CheckoutStorageService.getMollieCheckoutData();
  const session: MollieCheckoutSessionData = {
    paymentId: paymentIdFromUrl || stored?.paymentId || null,
    lineItems: stored?.lineItems ?? null,
    shippingAddress: stored?.shippingAddress ?? null,
    cartId: stored?.cartId ?? null,
    orderAmount: stored?.orderAmount ?? null,
    shippingCostCents: stored?.shippingCostCents ?? null,
    discountCents: stored?.discountCents ?? null,
    cartSnapshot: stored?.cartSnapshot ?? null,
  };

  if (!isIncomplete(session)) return session;

  try {
    const pendingRecoveries =
      await PaymentRecoveryService.getPendingRecoveries();
    const recovery = pendingRecoveries.find(
      (r) =>
        r.payment_provider === "mollie" &&
        (!session.paymentId || r.payment_intent_id === session.paymentId),
    );
    if (!recovery) return session;

    return {
      ...session,
      paymentId: recovery.payment_intent_id,
      lineItems: JSON.stringify(recovery.line_items),
      shippingAddress: JSON.stringify(recovery.shipping_address),
      orderAmount: String(recovery.amount),
      cartSnapshot: JSON.stringify(recovery.cart_snapshot),
      cartId: recovery.cart_snapshot?.id ?? session.cartId,
    };
  } catch (recoveryError) {
    captureError(recoveryError, {
      service: PAYMENT_RETURN_SERVICE_NAME.mollie,
      action: "recoverFromDatabase",
    });
    return session;
  }
}

const toOptionalNumber = (value: string | null) =>
  value ? Number(value) : undefined;

/** Parse and validate the serialized session into an orderable context. */
export async function buildMollieOrderContext(
  session: MollieCheckoutSessionData,
  cartId: string,
  t: PaymentReturnTranslatorT,
): Promise<MollieOrderContextI> {
  if (!session.lineItems || !session.shippingAddress) {
    throw new UserFacingError(t("errorMissingContext"));
  }

  const lineItems = JSON.parse(session.lineItems) as PrintifyLineItem[];
  // Legacy recovery snapshots include unselected rows. Normalize once so
  // recovery records, order creation and cleanup use the same items.
  const cartSnapshot = CartServiceMapper.mapCartToCheckoutCart(
    session.cartSnapshot
      ? (JSON.parse(session.cartSnapshot) as CartWithItems)
      : await CartService.getCheckoutCart(cartId),
  );

  if (
    !Array.isArray(lineItems) ||
    lineItems.length === 0 ||
    !Array.isArray(cartSnapshot.cart_items) ||
    cartSnapshot.cart_items.length === 0
  ) {
    throw new UserFacingError(t("errorNoOrderItems"));
  }

  return {
    cartSnapshot,
    lineItems: lineItems.map(validatePrintifyLineItem),
    shippingAddress: JSON.parse(session.shippingAddress) as ShippingAddressT,
    amount: session.orderAmount ? parseFloat(session.orderAmount) : 0,
    shippingCostCents: toOptionalNumber(session.shippingCostCents),
    discountCents: toOptionalNumber(session.discountCents),
  };
}
