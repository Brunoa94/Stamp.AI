import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts";
import { requireUser } from "../_shared/authGuard.ts";
import { enforceOperationLimit } from "../_shared/operationLimit.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

const CLAIM_LIMIT = { limit: 5, seconds: 60 };

/**
 * Moves a guest's products and Printify image ownership from their
 * anonymous user to the registered account that just logged in, so checkout
 * pricing (which rejects products owned by another user) accepts them.
 *
 * The caller proves both identities: their own JWT as the bearer token, and
 * the guest's previous anonymous access token in the body.
 */
export async function handleClaimGuestProducts(req: Request): Promise<Response> {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const caller = await requireUser(req.headers.get("authorization"));
    if (caller.isServiceRole || caller.isAnonymous) {
      throw new FunctionError(403, "REGISTERED_USER_REQUIRED", "Only a registered account can claim guest products");
    }
    await enforceOperationLimit(caller.userId, "claim-guest-products", CLAIM_LIMIT.limit, CLAIM_LIMIT.seconds);

    const body = await req.json().catch(() => null) as { anonymousAccessToken?: unknown } | null;
    const guestToken = typeof body?.anonymousAccessToken === "string" ? body.anonymousAccessToken.trim() : "";
    if (!guestToken) throw ErrorCodes.INVALID_REQUEST_BODY();

    const guest = await requireUser(`Bearer ${guestToken}`).catch(() => {
      throw new FunctionError(400, "INVALID_GUEST_TOKEN", "The guest session is invalid or expired");
    });
    if (guest.isServiceRole || !guest.isAnonymous) {
      throw new FunctionError(403, "NOT_A_GUEST", "Only an anonymous guest's products can be claimed");
    }

    const guestFilter = `user_id=eq.${encodeURIComponent(guest.userId)}`;

    const products = await supabaseRest<unknown[]>(`products?${guestFilter}`, "PATCH", {
      user_id: caller.userId,
    }, { prefer: "return=representation" });
    if (products.error) throw new FunctionError(500, "CLAIM_FAILED", "Could not move guest products");

    // Copy then delete: the account may already own one of these images,
    // and (image_id, user_id) is the primary key.
    const images = await supabaseRest<{ image_id: string }[]>(
      `printify_image_owners?${guestFilter}&select=image_id`,
      "GET",
    );
    if (images.error) throw new FunctionError(500, "CLAIM_FAILED", "Could not read guest images");
    const imageRows = (images.data ?? []).map(({ image_id }) => ({ image_id, user_id: caller.userId }));

    if (imageRows.length > 0) {
      const copied = await supabaseRest("printify_image_owners", "POST", imageRows, {
        prefer: "resolution=ignore-duplicates",
      });
      if (copied.error) throw new FunctionError(500, "CLAIM_FAILED", "Could not move guest images");
      const removed = await supabaseRest(`printify_image_owners?${guestFilter}`, "DELETE");
      if (removed.error) throw new FunctionError(500, "CLAIM_FAILED", "Could not move guest images");
    }

    return new Response(
      JSON.stringify({ success: true, products: products.data?.length ?? 0, images: imageRows.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return handleError(error, corsHeaders);
  }
}
