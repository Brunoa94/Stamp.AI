import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { validateEnvVars, validateRequest } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import {
  STRIPE_MODE_METADATA_KEY,
  createStripeClient,
  resolveStripeMode,
} from "../_shared/stripeConfig.ts";
import { validatePricingAgainstDatabase, type LineItemForPricingI } from "../_shared/serverPriceService.ts";
import type { PaymentIntentResponseI } from "../../types/index.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

/**
 * Verify authentication - accepts both user JWT tokens and service role key
 * Returns user info if available, or service identifier if using service role
 */
async function verifyAuth(
  authHeader: string | null,
): Promise<{ userId: string; userEmail: string }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = validateEnvVars.supabaseUrl();
  const supabaseAnonKey = validateEnvVars.supabaseAnonKey();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // Check if it's the service role key (server-to-server calls)
  if (serviceRoleKey && token === serviceRoleKey) {
    return {
      userId: "service-role",
      userEmail: "service@system.internal",
    };
  }

  // Otherwise, validate as user JWT token
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "apikey": supabaseAnonKey,
    },
  });

  if (!response.ok) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  const user = await response.json();

  if (!user || !user.id) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  return {
    userId: user.id,
    userEmail: user.email || "",
  };
}

const FREE_SHIPPING_THRESHOLD_CENTS = 6000;
const SHIPPING_COST_CENTS = 499;

interface OwnedCartItemI {
  product_id: string | null;
  variant_id: string | null;
  unit_price: number | null;
}

/**
 * Server-side total for existing-product line items: unit prices come from the
 * caller's own cart rows (matched on product + variant), shipping follows the
 * store rule, and a discount is only granted for a promo code that validates
 * against the promocodes table. All values are cents.
 */
async function expectedTotalCentsFromCart(
  userId: string,
  items: Array<Record<string, unknown>>,
  promoCode?: unknown,
): Promise<number> {
  const owned = await supabaseRest<OwnedCartItemI[]>(
    `cart_items?select=product_id,variant_id,unit_price,carts!inner(user_id)&carts.user_id=eq.${encodeURIComponent(userId)}`,
    "GET",
  );
  if (owned.error) throw new FunctionError(500, "CART_LOOKUP_FAILED", "Could not verify cart prices");
  const rows = owned.data ?? [];

  let subtotal = 0;
  for (const item of items) {
    const productId = String(item.product_id);
    const variantId = item.variant_id === undefined || item.variant_id === null ? null : String(item.variant_id);
    const quantity = Number(item.quantity) || 1;
    const row = rows.find((r) =>
      r.product_id === productId && (variantId === null || r.variant_id === null || String(r.variant_id) === variantId)
    );
    if (!row || row.unit_price === null) {
      throw new FunctionError(400, "PRICE_MISMATCH", `No priced cart item for product ${productId}`);
    }
    subtotal += Math.round(Number(row.unit_price)) * quantity;
  }

  let discount = 0;
  if (typeof promoCode === "string" && promoCode.trim()) {
    const code = promoCode.trim().toUpperCase();
    const promo = await supabaseRest<Array<{ type: string; value: number; is_active?: boolean; expires_at?: string | null; max_uses?: number | null; used_count?: number | null }>>(
      `promocodes?code=eq.${encodeURIComponent(code)}&select=*&limit=1`,
      "GET",
    );
    const row = promo.data?.[0];
    const usable = row && row.is_active !== false &&
      (!row.expires_at || new Date(row.expires_at) > new Date()) &&
      (row.max_uses === null || row.max_uses === undefined || (row.used_count ?? 0) < row.max_uses);
    if (!usable) throw new FunctionError(400, "INVALID_PROMO_CODE", "Promotion is not valid");
    const raw = row.type === "percentage" ? Math.round(subtotal * (Number(row.value) / 100)) : Math.round(Number(row.value) * 100);
    discount = Math.max(0, Math.min(raw, subtotal));
  }

  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_COST_CENTS;
  return afterDiscount + shipping;
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    const { userId, userEmail } = await verifyAuth(authHeader);

    const {
      amount,
      currency = "usd",
      line_items,
      shipping_address,
      shipping_cost_cents = 0,
      discount_cents = 0,
      metadata,
      payment_method, // Optional: for testing with pm_card_visa, etc.
      confirm = false, // Optional: auto-confirm payment (for testing)
      test_mode = false, // Optional: use Stripe Test Mode credentials
      promo_code, // Optional: applied promotion, re-validated server-side
    } = await req.json();

    // Pick the credential set up-front so a misconfigured test request
    // fails before any pricing work is done.
    const stripeMode = resolveStripeMode(test_mode);
    const stripe = createStripeClient(stripeMode, "2023-10-16");
    const validAmount = validateRequest.amount(amount);

    // SERVER-SIDE PRICE VALIDATION (C4 - Amount Tampering Prevention)
    // If line_items contain blueprint_id and printify_variant_id, validate against DB prices
    if (line_items && Array.isArray(line_items) && line_items.length > 0) {
      const itemsForPricing: LineItemForPricingI[] = line_items
        .filter((item: Record<string, unknown>) => item.blueprint_id && item.printify_variant_id)
        .map((item: Record<string, unknown>) => ({
          blueprint_id: Number(item.blueprint_id),
          printify_variant_id: Number(item.printify_variant_id),
          quantity: Number(item.quantity) || 1,
        }));

      if (itemsForPricing.length > 0) {
        const clientTotalCents = Math.round(validAmount * 100);
        const validation = await validatePricingAgainstDatabase({
          lineItems: itemsForPricing,
          clientSubtotalCents: clientTotalCents - shipping_cost_cents + discount_cents,
          shippingCostCents: shipping_cost_cents,
          discountCents: discount_cents,
          clientTotalCents,
        });

        if (!validation.isValid) {
          throw new FunctionError(
            400,
            "PRICE_MISMATCH",
            validation.errorMessage || "Server-side price validation failed"
          );
        }
      }

      // Existing-product line items (product_id) are priced from the caller's
      // own cart rows, never from the request, so a tampered `amount` is rejected.
      const productItems = line_items.filter(
        (item: Record<string, unknown>) => item.product_id && !item.blueprint_id,
      );
      if (productItems.length > 0 && userId !== "service-role") {
        const expectedCents = await expectedTotalCentsFromCart(userId, productItems, promo_code);
        const clientTotalCents = Math.round(validAmount * 100);
        if (Math.abs(expectedCents - clientTotalCents) > 1) {
          console.error(
            `❌ PRICE_MISMATCH: client ${clientTotalCents} cents, server ${expectedCents} cents for user ${userId}`,
          );
          throw new FunctionError(400, "PRICE_MISMATCH", "Payment amount does not match the cart");
        }
      }
    }

    // Build payment intent options
    const paymentIntentOptions: any = {
      amount: Math.round(validAmount * 100), // Convert to cents
      currency: currency,
      metadata: {
        ...metadata,
        user_id: userId,
        user_email: userEmail,
        line_items: JSON.stringify(line_items),
        shipping_address: JSON.stringify(shipping_address),
        [STRIPE_MODE_METADATA_KEY]: stripeMode,
      },
    };

    // If a test payment method is provided (e.g., pm_card_visa), attach it
    if (payment_method) {
      paymentIntentOptions.payment_method = payment_method;
      paymentIntentOptions.payment_method_types = ["card"];
      if (confirm) {
        paymentIntentOptions.confirm = true;
      }
    } else {
      // For regular checkout flow with card element
      paymentIntentOptions.automatic_payment_methods = {
        enabled: true,
      };
    }

    // Create payment intent
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);
    } catch (stripeError: any) {
      throw ErrorCodes.STRIPE_API_ERROR(
        stripeError.message || JSON.stringify(stripeError),
      );
    }

    // Create payment_transactions record immediately with user_id
    // Webhook will later update this record to 'succeeded' or 'failed'
    try {
      await supabaseRest(
        "payment_transactions",
        "POST",
        {
          user_id: userId,
          payment_provider: "stripe",
          stripe_payment_intent_id: paymentIntent.id,
          stripe_customer_id: paymentIntent.customer,
          amount: validAmount,
          currency: currency.toLowerCase(),
          status: "pending",
          payment_method_type: payment_method ? "card" : null,
          metadata: {
            ...metadata,
            user_id: userId,
            user_email: userEmail,
            line_items: line_items,
            shipping_address: shipping_address,
            [STRIPE_MODE_METADATA_KEY]: stripeMode,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { prefer: "resolution=merge-duplicates" },
      );
    } catch {
      // Transaction record creation is best-effort; webhook can still process it
    }

    const response: PaymentIntentResponseI = {
      success: true,
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return handleError(error, corsHeaders);
  }
});
