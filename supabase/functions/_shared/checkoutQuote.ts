import { corsHeadersFor } from "./cors.ts";
import { FunctionError, handleError } from "./errors.ts";
import { verifyAuth } from "./validators.ts";
import { enforceOperationLimit } from "./operationLimit.ts";
import { priceCheckout } from "./checkoutPricing.ts";

export async function checkoutQuoteHandler(req: Request): Promise<Response> {
  const headers = { ...corsHeadersFor(req), "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  try {
    if (req.method !== "POST") throw new FunctionError(405, "METHOD_NOT_ALLOWED", "Use POST");
    const { userId } = await verifyAuth(req.headers.get("authorization"));
    if (userId === "service-role") throw new FunctionError(403, "UNAUTHORIZED", "User session required");
    await enforceOperationLimit(userId, "checkout-quote", 120, 60);
    const { line_items, promo_code } = await req.json();
    const pricing = await priceCheckout({ lineItems: line_items, promoCode: promo_code, userId });
    return new Response(JSON.stringify(pricing), { headers });
  } catch (error) {
    return handleError(error, headers);
  }
}
