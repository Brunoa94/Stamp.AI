import type { CartItem } from "@/shared/types/cart";
import type { PrintifyLineItem } from "@/shared/types/printifyOrder";
import type { AnalyticsItemT, AnalyticsEventParamsT } from "../types/analyticsTypes";

/**
 * E-commerce Analytics Mappers
 *
 * Centralized mapping functions for GA4 e-commerce event payloads.
 * These ensure consistent data structure across all tracking calls.
 */

// ============================================================================
// CART ITEM MAPPERS
// ============================================================================

/**
 * Map a cart item to a GA4 analytics item
 */
export function mapCartItemToAnalyticsItem(item: CartItem): AnalyticsItemT {
  return {
    item_id: item.product_id || item.id,
    item_name: item.product_name || "Custom Product",
    price: (item.selling_price ?? item.unit_price ?? 0) / 100,
    quantity: item.quantity ?? 1,
  };
}

/**
 * Map cart items array to analytics items array
 */
export function mapCartItemsToAnalyticsItems(items: CartItem[]): AnalyticsItemT[] {
  return items.map(mapCartItemToAnalyticsItem);
}

// ============================================================================
// VIEW CART EVENT
// ============================================================================

export interface ViewCartParams {
  items: CartItem[];
  value: number;
}

export function mapViewCartEvent(params: ViewCartParams): AnalyticsEventParamsT {
  return {
    currency: "EUR",
    value: params.value,
    items: mapCartItemsToAnalyticsItems(params.items),
  };
}

// ============================================================================
// BEGIN CHECKOUT EVENT
// ============================================================================

export interface BeginCheckoutParams {
  items: CartItem[];
  value: number;
}

export function mapBeginCheckoutEvent(params: BeginCheckoutParams): AnalyticsEventParamsT {
  return {
    currency: "EUR",
    value: params.value,
    items: mapCartItemsToAnalyticsItems(params.items),
  };
}

// ============================================================================
// ADD PAYMENT INFO EVENT
// ============================================================================

export interface AddPaymentInfoParams {
  lineItems: PrintifyLineItem[];
  amount: number;
  paymentType?: string;
}

export function mapAddPaymentInfoEvent(params: AddPaymentInfoParams): AnalyticsEventParamsT {
  return {
    currency: "EUR",
    value: params.amount / 100,
    payment_type: params.paymentType ?? "card",
    items: params.lineItems.map((item, index) => ({
      item_id: item.product_id ?? item.sku ?? String(item.blueprint_id ?? index),
      item_name: "Custom Product",
      quantity: item.quantity,
    })),
  };
}

// ============================================================================
// PURCHASE EVENT
// ============================================================================

export interface PurchaseParams {
  transactionId: string;
  lineItems: PrintifyLineItem[];
  /** Amount charged, in cents (merchandise + shipping - discount). */
  amount: number;
  /** Merchandise subtotal before shipping, in cents. Defaults to `amount`. */
  merchandiseCents?: number;
  /** Shipping charged, in cents. */
  shippingCents?: number;
  /** Discount applied, in cents. */
  discountCents?: number;
  paymentMethod?: string;
}

/**
 * GA4 `purchase`: `value` is the merchandise amount after discounts; shipping
 * is reported in its own parameter (GA4 ecommerce guidance, scenario GA-05).
 */
export function mapPurchaseEvent(params: PurchaseParams): AnalyticsEventParamsT {
  const totalQuantity = params.lineItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const merchandiseCents = params.merchandiseCents ?? params.amount;
  const valueCents = merchandiseCents - (params.discountCents ?? 0);
  const pricePerItem = totalQuantity > 0 ? (merchandiseCents / 100) / totalQuantity : 0;

  return {
    transaction_id: params.transactionId,
    currency: "EUR",
    value: Math.round(valueCents) / 100,
    shipping: Math.round(params.shippingCents ?? 0) / 100,
    payment_method: params.paymentMethod ?? "stripe",
    items: params.lineItems.map((lineItem, index) => ({
      item_id:
        lineItem.product_id ??
        lineItem.sku ??
        String(lineItem.blueprint_id ?? index),
      item_name: "Custom Product",
      price: pricePerItem,
      quantity: lineItem.quantity,
      item_variant: lineItem.variant_id?.toString(),
    })),
  };
}
