/**
 * Order Finalization (pure decisions)
 *
 * Orders are minted by the server from a verified payment plus an "order
 * source": the cart snapshot the customer checked out, or, when no snapshot
 * exists (browser crashed before recording it), the Printify line items stored
 * with the payment. Prices never come from the source; every item is repriced
 * from the catalog (see serverPriceService.ts) and this module only maps the
 * result to database rows and decides idempotency.
 *
 * All money values are integer cents (orders.* and order_items.* columns hold
 * cents, see docs/invoicing.md).
 */

import { FunctionError } from "./errors.ts";
import { selectCheckoutCartItems } from "./cartSelection.ts";
import type { LineItemForPricingI, PricedLineItemI } from "./lineItemsForPricing.ts";
import type { OrderTotalsI } from "./orderTotals.ts";

import { buildIdempotencyKey, type PaymentProviderT } from "./paymentReference.ts";

export type { PaymentProviderT } from "./paymentReference.ts";

/** Cart snapshot item as stored by the checkout clients / payment_recovery. */
export interface OrderSourceCartItemI {
  id?: string;
  product_id?: string | null;
  product_name?: string | null;
  name?: string | null;
  variant_id?: string | number | null;
  variant_name?: string | null;
  quantity?: number | null;
  custom_image_url?: string | null;
  is_selected?: boolean | null;
  printify_blueprint_id?: number | null;
  product?: { blueprint_id?: number | null; name?: string | null } | null;
}

export interface OrderSourceI {
  cartItems?: OrderSourceCartItemI[] | null;
  lineItems?: Array<Record<string, unknown>> | null;
}

/** Normalised item ready for catalog pricing and order_items mapping. */
export interface OrderSourceItemI extends LineItemForPricingI {
  product_id: string | null;
  product_name: string | null;
  variant_name: string | null;
  custom_image_url: string;
}

export interface ResolvedOrderSourceI {
  items: OrderSourceItemI[];
  errors: string[];
}

function toPositiveInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function cartItemToSourceItem(item: OrderSourceCartItemI, index: number): OrderSourceItemI | string {
  const blueprintId = toPositiveInteger(item.printify_blueprint_id ?? item.product?.blueprint_id);
  if (blueprintId === null) return `Cart item ${index}: missing blueprint id for catalog pricing`;
  const variantId = toPositiveInteger(item.variant_id);
  if (variantId === null) return `Cart item ${index}: missing Printify variant id`;
  const quantity = toPositiveInteger(item.quantity ?? 1);
  if (quantity === null) return `Cart item ${index}: invalid quantity`;

  return {
    blueprint_id: blueprintId,
    printify_variant_id: variantId,
    quantity,
    product_id: toNullableString(item.product_id),
    product_name: toNullableString(item.product_name) ?? toNullableString(item.name) ?? toNullableString(item.product?.name),
    variant_name: toNullableString(item.variant_name),
    custom_image_url: toNullableString(item.custom_image_url) ?? "",
  };
}

/** First print-area image of a Printify line item, if any. */
function lineItemImageUrl(lineItem: Record<string, unknown>): string {
  const printAreas = lineItem.print_areas;
  if (!printAreas || typeof printAreas !== "object") return "";
  for (const images of Object.values(printAreas as Record<string, unknown>)) {
    if (Array.isArray(images)) {
      for (const image of images) {
        const src = (image as { src?: unknown })?.src;
        if (typeof src === "string" && src) return src;
      }
    }
  }
  return "";
}

function lineItemToSourceItem(lineItem: Record<string, unknown>, index: number): OrderSourceItemI | string {
  const blueprintId = toPositiveInteger(lineItem.blueprint_id);
  if (blueprintId === null) return `Line item ${index}: missing blueprint_id for catalog pricing`;
  const variantId = toPositiveInteger(lineItem.printify_variant_id ?? lineItem.variant_id);
  if (variantId === null) return `Line item ${index}: missing variant_id`;
  const quantity = toPositiveInteger(lineItem.quantity ?? 1);
  if (quantity === null) return `Line item ${index}: invalid quantity`;

  return {
    blueprint_id: blueprintId,
    printify_variant_id: variantId,
    quantity,
    product_id: toNullableString(lineItem.product_id),
    product_name: null,
    variant_name: null,
    custom_image_url: lineItemImageUrl(lineItem),
  };
}

/**
 * Normalise the order source. A cart snapshot wins when present (only its
 * selected items are used); otherwise the Printify line items are used. An
 * explicit empty selection is an error, never "buy everything".
 */
export function resolveOrderSourceItems(source: OrderSourceI): ResolvedOrderSourceI {
  const items: OrderSourceItemI[] = [];
  const errors: string[] = [];

  const cartItems = source.cartItems ?? [];
  const lineItems = source.lineItems ?? [];

  if (cartItems.length > 0) {
    const selected = selectCheckoutCartItems(cartItems);
    if (selected.length === 0) {
      return { items, errors: ["No cart items are selected for checkout"] };
    }
    selected.forEach((item, index) => {
      const mapped = cartItemToSourceItem(item, index);
      if (typeof mapped === "string") errors.push(mapped);
      else items.push(mapped);
    });
  } else if (lineItems.length > 0) {
    lineItems.forEach((lineItem, index) => {
      const mapped = lineItemToSourceItem(lineItem ?? {}, index);
      if (typeof mapped === "string") errors.push(mapped);
      else items.push(mapped);
    });
  } else {
    return { items, errors: ["Order source has no items"] };
  }

  return errors.length > 0 ? { items: [], errors } : { items, errors };
}

export function toPricingLineItems(items: OrderSourceItemI[]): LineItemForPricingI[] {
  return items.map(({ blueprint_id, printify_variant_id, quantity }) => ({
    blueprint_id,
    printify_variant_id,
    quantity,
  }));
}

export interface OrderAddressI {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  [key: string]: unknown;
}

export interface FinalizeOrderContextI {
  provider: PaymentProviderT;
  paymentId: string;
  userId: string;
  userEmail: string;
  currency: string;
  shippingAddress: OrderAddressI | null;
  billingAddress: OrderAddressI | null;
  promoCode: string | null;
  promoValue: number | null;
}

export interface OrderInsertI {
  user_id: string;
  order_number: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: OrderAddressI | null;
  billing_address: OrderAddressI | null;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_status: "paid";
  status: "pending";
  payment_method: PaymentProviderT;
  payment_provider: PaymentProviderT;
  promo_code: string | null;
  promo_value: number | null;
  idempotency_key: string;
}

/** A PAID order row from server totals. Fulfilment sets `status` later. */
export function buildOrderInsert(
  context: FinalizeOrderContextI,
  totals: OrderTotalsI,
  orderNumber: string,
): OrderInsertI {
  const address = context.shippingAddress;
  const fullName = [address?.first_name, address?.last_name].filter(Boolean).join(" ").trim();

  return {
    user_id: context.userId,
    order_number: orderNumber,
    customer_email: toNullableString(address?.email) ?? context.userEmail,
    customer_name: fullName || null,
    customer_phone: toNullableString(address?.phone),
    shipping_address: address,
    billing_address: context.billingAddress ?? address,
    subtotal: totals.subtotal_cents,
    discount_amount: totals.discount_cents,
    shipping_cost: totals.shipping_cents,
    tax_amount: totals.tax_cents,
    total_amount: totals.total_cents,
    currency: context.currency.toUpperCase(),
    payment_status: "paid",
    status: "pending",
    payment_method: context.provider,
    payment_provider: context.provider,
    promo_code: context.promoCode,
    promo_value: context.promoValue,
    idempotency_key: buildIdempotencyKey(context.provider, context.paymentId),
  };
}

export interface OrderItemInsertI {
  order_id: string;
  product_id: string | null;
  product_name: string;
  variant_id: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  custom_image_url: string;
  design_config: { custom_image_url: string; reusable_image_url: string } | null;
}

/** order_items rows: catalog prices (cents) + display data from the source. */
export function buildOrderItemInserts(
  orderId: string,
  priced: PricedLineItemI[],
  sourceItems: OrderSourceItemI[],
): OrderItemInsertI[] {
  if (priced.length !== sourceItems.length) {
    throw new Error("Priced line items do not match the order source");
  }

  return priced.map((line, index) => {
    const source = sourceItems[index];
    if (
      source.blueprint_id !== line.blueprint_id ||
      source.printify_variant_id !== line.printify_variant_id
    ) {
      throw new Error("Priced line items are out of order with the order source");
    }
    return {
      order_id: orderId,
      product_id: source.product_id,
      product_name: source.product_name ?? line.product_name ?? "Product",
      variant_id: String(line.printify_variant_id),
      variant_name: source.variant_name,
      quantity: line.quantity,
      unit_price: line.unit_price_cents,
      total_price: line.total_cents,
      custom_image_url: source.custom_image_url,
      design_config: source.custom_image_url
        ? { custom_image_url: source.custom_image_url, reusable_image_url: source.custom_image_url }
        : null,
    };
  });
}

export interface ExistingOrderI {
  id: string;
  order_number?: string | null;
  user_id: string | null;
  payment_status: string | null;
}

/** Reuse an order minted earlier for the same payment, but only the owner's. */
export function decideExistingOrder(
  existing: ExistingOrderI | null,
  ownerUserId: string,
): "create" | "reuse" {
  if (!existing) return "create";
  if (existing.user_id !== ownerUserId) {
    throw new FunctionError(403, "FORBIDDEN", "Order belongs to another user");
  }
  return "reuse";
}

export function generateOrderNumber(now: number = Date.now(), random: number = Math.random()): string {
  const suffix = Math.floor(random * 36 ** 6).toString(36).toUpperCase().padStart(6, "0");
  return `ORD-${now}-${suffix}`;
}
