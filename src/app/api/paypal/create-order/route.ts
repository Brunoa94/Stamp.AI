import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPayPalOrder } from "@/lib/paypal-server";
import { captureError } from "@/lib/observability/errorCapture";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import {
  parseLineItemsForPricing,
  priceLineItems,
  type CatalogProductNameI,
  type CatalogVariantPriceI,
} from "../../../../../supabase/functions/_shared/lineItemsForPricing";
import {
  calculateOrderTotals,
  majorUnitsToCents,
  reconcileClientTotalCents,
  resolveOrderTotalsConfig,
  toPricingMetadata,
} from "../../../../../supabase/functions/_shared/orderTotals";
import {
  calculatePromoDiscountCents,
  normalizePromoCode,
  type PromoCodeRuleI,
} from "../../../../../supabase/functions/_shared/promoDiscount";

export const runtime = "nodejs";

interface CreateOrderRequestI {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  returnUrl: string;
  cancelUrl: string;
  promoCode?: string;
}

type PricingErrorCodeT = "INVALID_LINE_ITEMS" | "PRICING_FAILED" | "INVALID_PROMO_CODE" | "PRICE_MISMATCH";

class PricingError extends Error {
  constructor(public readonly code: PricingErrorCodeT, message: string) {
    super(message);
    this.name = "PricingError";
  }
}

type ServerClientT = Awaited<ReturnType<typeof createClient>>;

/**
 * Reprice the order from the catalog and promocodes table. The client
 * `amount` is only compared against the result; it is never charged as-is.
 */
async function priceOrderServerSide(
  supabase: ServerClientT,
  body: CreateOrderRequestI,
) {
  const parsed = parseLineItemsForPricing(body.lineItems);
  if (parsed.errors.length > 0) {
    throw new PricingError("INVALID_LINE_ITEMS", parsed.errors.join("; "));
  }

  const blueprintIds = [...new Set(parsed.items.map((item) => item.blueprint_id))];
  const variantIds = [...new Set(parsed.items.map((item) => item.printify_variant_id))];

  const [variantsResult, productsResult] = await Promise.all([
    supabase
      .from("product_variants")
      .select("blueprint_id, printify_variant_id, price_cents")
      .in("blueprint_id", blueprintIds)
      .in("printify_variant_id", variantIds),
    supabase.from("catalog_products").select("blueprint_id, display_title").in("blueprint_id", blueprintIds),
  ]);

  if (variantsResult.error) {
    throw new PricingError("PRICING_FAILED", "Failed to fetch variant prices");
  }

  const pricing = priceLineItems(
    parsed.items,
    (variantsResult.data ?? []) as CatalogVariantPriceI[],
    (productsResult.data ?? []) as CatalogProductNameI[],
  );
  if (!pricing.success) {
    throw new PricingError("PRICING_FAILED", pricing.errors.join("; "));
  }

  const promoCode = normalizePromoCode(body.promoCode);
  let promo: PromoCodeRuleI | null = null;
  if (promoCode) {
    const { data } = await supabase
      .from("promocodes")
      .select("code, type, value")
      .eq("code", promoCode)
      .maybeSingle();
    if (!data) {
      throw new PricingError("INVALID_PROMO_CODE", "Promo code not found");
    }
    promo = { type: data.type, value: Number(data.value) };
  }

  const config = resolveOrderTotalsConfig(process.env);
  const totals = calculateOrderTotals({
    subtotalCents: pricing.subtotal_cents,
    discountCents: calculatePromoDiscountCents(promo, pricing.subtotal_cents),
    config,
  });

  const reconciliation = reconcileClientTotalCents(totals, majorUnitsToCents(body.amount));
  if (!reconciliation.ok) {
    throw new PricingError(
      "PRICE_MISMATCH",
      `Client amount differs from server total by ${reconciliation.differenceCents} cents`,
    );
  }

  return { totals, currency: config.currency, pricingMetadata: toPricingMetadata(totals, promoCode) };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateOrderRequestI = await request.json();
    const { lineItems, shippingAddress, returnUrl, cancelUrl } = body;

    if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!returnUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Return and cancel URLs are required" },
        { status: 400 }
      );
    }

    // SERVER-SIDE PRICE VALIDATION: never charge the raw client amount
    const { totals, currency, pricingMetadata } = await priceOrderServerSide(supabase, body);
    const serverAmount = totals.total_cents / 100;

    // Build custom_id with metadata for webhook processing
    const customId = JSON.stringify({
      user_id: user.id,
      user_email: user.email,
      promo_code: pricingMetadata.promo_code,
      total_cents: pricingMetadata.total_cents,
      line_items: lineItems,
    });

    const paypalOrder = await createPayPalOrder({
      amount: serverAmount,
      currency,
      description: `Order for ${user.email}`,
      customId,
      shippingAddress: shippingAddress
        ? {
            firstName: shippingAddress.first_name,
            lastName: shippingAddress.last_name,
            address1: shippingAddress.address1,
            address2: shippingAddress.address2,
            city: shippingAddress.city,
            region: shippingAddress.region,
            zip: shippingAddress.zip?.trim() || "",
            country: shippingAddress.country,
          }
        : undefined,
      returnUrl,
      cancelUrl,
    });

    // Find approval URL
    const approvalLink = paypalOrder.links?.find((link) => link.rel === "approve");

    // Store payment transaction in database for tracking
    try {
      await supabase.from("payment_transactions").upsert(
        {
          user_id: user.id,
          payment_provider: "paypal",
          paypal_order_id: paypalOrder.id,
          amount: serverAmount,
          currency: currency.toLowerCase(),
          status: "pending",
          metadata: {
            ...pricingMetadata,
            user_id: user.id,
            user_email: user.email,
            line_items: lineItems,
            shipping_address: shippingAddress,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "paypal_order_id" }
      );
    } catch (dbError) {
      // Log error but don't fail the request - webhook can still process it
      console.error("Failed to create payment_transactions record:", dbError);
    }

    return NextResponse.json({
      success: true,
      orderId: paypalOrder.id,
      approvalUrl: approvalLink?.href,
    });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: error.code }, { status: 400 });
    }

    captureError(error, {
      service: "PayPalAPI",
      action: "createOrder",
    });

    return NextResponse.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
