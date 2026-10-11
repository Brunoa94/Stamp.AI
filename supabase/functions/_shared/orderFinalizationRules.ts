/**
 * Pure rules for turning a verified payment into a paid order.
 *
 * The order is built from what the server priced and stored on the payment
 * transaction (pricingMetadata in checkoutPricing.ts), never from amounts the
 * browser sends. Cart rows only contribute display data (name, image), and
 * only when they are exactly the items that were paid for.
 *
 * Kept free of Deno-specific imports so src/tests/edge-functions can import it.
 */

export type PaymentProviderT = "stripe" | "paypal" | "mollie";

export const PAYMENT_PROVIDERS: readonly PaymentProviderT[] = ["stripe", "paypal", "mollie"];

/** Netherlands standard rate; prices are VAT-inclusive. */
export const DEFAULT_VAT_RATE_BPS = 2100;

const REFERENCE_COLUMN: Record<PaymentProviderT, string> = {
  stripe: "stripe_payment_intent_id",
  paypal: "paypal_order_id",
  mollie: "mollie_payment_id",
};

export function isPaymentProvider(value: unknown): value is PaymentProviderT {
  return typeof value === "string" && (PAYMENT_PROVIDERS as readonly string[]).includes(value);
}

/** payment_transactions column holding the provider's payment reference. */
export function paymentReferenceColumn(provider: PaymentProviderT): string {
  return REFERENCE_COLUMN[provider];
}

/** Same key the checkout return pages and webhooks have always used. */
export function orderIdempotencyKey(provider: PaymentProviderT, paymentId: string): string {
  return `${provider}_${paymentId}`;
}

export interface PricedOrderItemI {
  blueprintId: number;
  variantId: number;
  quantity: number;
  unitPriceCents: number;
  productId?: string;
}

export interface StoredPricingI {
  promoCode: string | null;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  items: PricedOrderItemI[];
}

function nonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function positiveInteger(value: unknown): number | null {
  const parsed = nonNegativeInteger(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

/**
 * Reads the server pricing stored on payment_transactions.metadata.
 * Returns null when it is missing or inconsistent, so no order can be built
 * from a transaction the payment functions did not price.
 */
export function parseStoredPricing(metadata: unknown): StoredPricingI | null {
  if (!metadata || typeof metadata !== "object") return null;
  const record = metadata as Record<string, unknown>;
  const subtotalCents = nonNegativeInteger(record.subtotal_cents);
  const discountCents = nonNegativeInteger(record.discount_cents);
  const shippingCents = nonNegativeInteger(record.shipping_cost_cents);
  const totalCents = positiveInteger(record.total_cents);
  if (subtotalCents === null || discountCents === null || shippingCents === null || totalCents === null) return null;
  if (subtotalCents + shippingCents - discountCents !== totalCents) return null;
  if (!Array.isArray(record.priced_items) || record.priced_items.length === 0) return null;

  const items: PricedOrderItemI[] = [];
  for (const entry of record.priced_items) {
    if (!entry || typeof entry !== "object") return null;
    const item = entry as Record<string, unknown>;
    const blueprintId = positiveInteger(item.blueprint_id);
    const variantId = positiveInteger(item.variant_id);
    const quantity = positiveInteger(item.quantity);
    const unitPriceCents = positiveInteger(item.unit_price_cents);
    if (blueprintId === null || variantId === null || quantity === null || unitPriceCents === null) return null;
    const productId = typeof item.product_id === "string" && item.product_id ? item.product_id : undefined;
    items.push({ blueprintId, variantId, quantity, unitPriceCents, ...(productId ? { productId } : {}) });
  }
  if (items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0) !== subtotalCents) return null;

  const promoCode = typeof record.promo_code === "string" && record.promo_code ? record.promo_code : null;
  return { promoCode, subtotalCents, discountCents, shippingCents, totalCents, items };
}

/** The provider amount (major units) must equal the stored server total. */
export function chargeMatchesPricing(paidAmount: number, paidCurrency: string, pricing: StoredPricingI): boolean {
  return Math.round(paidAmount * 100) === pricing.totalCents && paidCurrency.toUpperCase() === "EUR";
}

export function parseVatRateBps(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === "") return DEFAULT_VAT_RATE_BPS;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 && value <= 10000 ? value : DEFAULT_VAT_RATE_BPS;
}

/** VAT contained in a VAT-inclusive amount, rounded to the cent. */
export function includedVatCents(totalCents: number, rateBps: number): number {
  if (rateBps <= 0 || totalCents <= 0) return 0;
  return totalCents - Math.round((totalCents * 10000) / (10000 + rateBps));
}

export interface CartItemRowI {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  quantity: number | null;
  product_name: string | null;
  variant_name: string | null;
  custom_image_url: string | null;
}

const MAX_TEXT_LENGTH = 500;
const MAX_CART_ITEMS = 100;

function optionalText(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.length <= MAX_TEXT_LENGTH) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

/**
 * Validates the cart snapshot a return page sends. Only identity and display
 * fields are read; prices always come from the stored server pricing.
 */
export function parseCartSnapshotItems(raw: unknown): CartItemRowI[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_CART_ITEMS) return null;
  const items: CartItemRowI[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") return null;
    const item = entry as Record<string, unknown>;
    const fields = [item.id, item.product_id, item.variant_id, item.product_name, item.variant_name, item.custom_image_url].map(optionalText);
    if (fields.some((field) => field === undefined)) return null;
    const [id, productId, variantId, productName, variantName, imageUrl] = fields as Array<string | null>;
    const quantity = positiveInteger(item.quantity ?? 1);
    if (quantity === null) return null;
    items.push({
      id: id ?? "",
      product_id: productId,
      variant_id: variantId,
      quantity,
      product_name: productName,
      variant_name: variantName,
      // Only web images are kept for display; anything else is dropped, not trusted.
      custom_image_url: imageUrl && /^https?:\/\//i.test(imageUrl) ? imageUrl : null,
    });
  }
  return items;
}

export interface MatchedOrderItemI {
  priced: PricedOrderItemI;
  cartItem: CartItemRowI | null;
}

function cartItemMatches(cartItem: CartItemRowI, priced: PricedOrderItemI): boolean {
  if (String(cartItem.variant_id ?? "") !== String(priced.variantId)) return false;
  if ((cartItem.quantity ?? 1) !== priced.quantity) return false;
  return !priced.productId || cartItem.product_id === priced.productId;
}

/**
 * Pairs every priced item with one cart row describing it.
 *
 * strict: the caller named the cart rows being bought, so they must be
 * exactly the priced items (no extra rows, none missing). Otherwise the rows
 * are only a source of display data and unmatched items keep a generic name.
 */
export function matchCartItems(
  priced: PricedOrderItemI[],
  cartItems: CartItemRowI[],
  strict: boolean,
): MatchedOrderItemI[] | null {
  const unused = [...cartItems];
  const matched: MatchedOrderItemI[] = [];
  for (const item of priced) {
    const index = unused.findIndex((cartItem) => cartItemMatches(cartItem, item));
    if (index === -1) {
      if (strict) return null;
      matched.push({ priced: item, cartItem: null });
      continue;
    }
    matched.push({ priced: item, cartItem: unused.splice(index, 1)[0] });
  }
  if (strict && unused.length > 0) return null;
  return matched;
}

export interface OrderAddressI {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export function parseAddress(raw: unknown): OrderAddressI | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return parseAddress(JSON.parse(raw));
    } catch {
      return null;
    }
  }
  return typeof raw === "object" && !Array.isArray(raw) ? raw as OrderAddressI : null;
}

export function generateOrderNumber(now: number, random: number): string {
  return `ORD-${now}-${Math.floor(random * 1000).toString().padStart(3, "0")}`;
}

export interface OrderRowInputI {
  provider: PaymentProviderT;
  paymentId: string;
  userId: string;
  customerEmail: string;
  shippingAddress: OrderAddressI | null;
  billingAddress: OrderAddressI | null;
  pricing: StoredPricingI;
  vatRateBps: number;
  orderNumber: string;
}

/** A paid order. Money columns are integer cents, as the checkout writes them. */
export function buildOrderRow(input: OrderRowInputI): Record<string, unknown> {
  const { pricing, shippingAddress } = input;
  const customerName = [shippingAddress?.first_name, shippingAddress?.last_name].filter(Boolean).join(" ").trim();
  return {
    user_id: input.userId,
    order_number: input.orderNumber,
    customer_email: input.customerEmail,
    customer_name: customerName || null,
    customer_phone: shippingAddress?.phone || null,
    shipping_address: shippingAddress,
    billing_address: input.billingAddress ?? shippingAddress,
    status: "confirmed",
    payment_status: "paid",
    payment_method: input.provider,
    payment_provider: input.provider,
    subtotal: pricing.subtotalCents,
    shipping_cost: pricing.shippingCents,
    discount_amount: pricing.discountCents,
    tax_amount: includedVatCents(pricing.totalCents, input.vatRateBps),
    total_amount: pricing.totalCents,
    currency: "EUR",
    promo_code: pricing.promoCode,
    idempotency_key: orderIdempotencyKey(input.provider, input.paymentId),
  };
}

export function buildOrderItemRows(orderId: string, items: MatchedOrderItemI[]): Array<Record<string, unknown>> {
  return items.map(({ priced, cartItem }) => {
    const imageUrl = cartItem?.custom_image_url || "";
    return {
      order_id: orderId,
      product_id: cartItem?.product_id ?? priced.productId ?? null,
      variant_id: String(priced.variantId),
      quantity: priced.quantity,
      unit_price: priced.unitPriceCents,
      total_price: priced.unitPriceCents * priced.quantity,
      custom_image_url: imageUrl,
      product_name: cartItem?.product_name || "Custom Product",
      variant_name: cartItem?.variant_name || null,
      design_config: imageUrl ? { custom_image_url: imageUrl, reusable_image_url: imageUrl } : null,
    };
  });
}
