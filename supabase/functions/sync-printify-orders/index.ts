import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { validateEnvVars, verifyAuth } from "../_shared/validators.ts";
import { supabaseRest } from "../_shared/supabase.ts";
import {
  REVIEW_STATUSES,
  mapPrintifyToOrderUpdate,
} from "./mapping.ts";
import type {
  OrderSyncUpdateT,
  PrintifyOrderI,
  SyncOrderRowI,
} from "./mapping.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BATCH_SIZE = 100;
const CONCURRENCY = 5;

async function flagForReview(
  dbOrder: SyncOrderRowI,
  printifyStatus: string,
  message: string
): Promise<void> {
  const result = await supabaseRest(
    "order_status_reconciliation",
    "POST",
    {
      order_id: dbOrder.id,
      expected_status: dbOrder.status ?? "unknown",
      actual_status: dbOrder.status,
      printify_order_id: dbOrder.printify_order_id,
      printify_status: printifyStatus,
      error_message: message,
      reconciliation_status: "manual_review_required",
    },
    { prefer: "return=minimal" }
  );

  if (result.error) {
    console.error("Failed to insert reconciliation row:", result.error);
  }
}

async function persistOrderUpdate(
  orderId: string,
  update: OrderSyncUpdateT | null,
  nowIso: string
): Promise<void> {
  const payload: Record<string, unknown> = {
    ...update,
    printify_synced_at: nowIso,
  };
  if (update) {
    payload.updated_at = nowIso;
  }

  const result = await supabaseRest(`orders?id=eq.${orderId}`, "PATCH", payload);

  if (result.error) {
    throw new Error(
      `Failed to update order ${orderId}: ${JSON.stringify(result.error)}`
    );
  }
}

interface SyncOutcomeI {
  updated: boolean;
  flaggedForReview: boolean;
  rateLimited: boolean;
  error?: string;
}

async function syncOrder(
  dbOrder: SyncOrderRowI,
  printifyToken: string,
  printifyShopId: string
): Promise<SyncOutcomeI> {
  const nowIso = new Date().toISOString();

  const response = await fetch(
    `https://api.printify.com/v1/shops/${printifyShopId}/orders/${dbOrder.printify_order_id}.json`,
    {
      headers: {
        Authorization: `Bearer ${printifyToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.status === 429 || response.status >= 500) {
    console.warn(
      `Printify returned ${response.status} for order ${dbOrder.id}, stopping run`
    );
    return { updated: false, flaggedForReview: false, rateLimited: true };
  }

  if (response.status === 404) {
    console.warn(
      `Printify order ${dbOrder.printify_order_id} not found (order ${dbOrder.id})`
    );
    if (dbOrder.printify_status !== "not-found") {
      await flagForReview(
        dbOrder,
        "not-found",
        `Printify order ${dbOrder.printify_order_id} returned 404`
      );
    }
    await persistOrderUpdate(
      dbOrder.id,
      dbOrder.printify_status !== "not-found"
        ? { printify_status: "not-found" }
        : null,
      nowIso
    );
    return { updated: false, flaggedForReview: true, rateLimited: false };
  }

  if (!response.ok) {
    const body = await response.text();
    throw ErrorCodes.PRINTIFY_ORDER_API_ERROR(
      `GET order ${dbOrder.printify_order_id} failed with ${response.status}: ${body}`
    );
  }

  const printifyOrder: PrintifyOrderI = await response.json();
  const update = mapPrintifyToOrderUpdate(dbOrder, printifyOrder, nowIso);

  const isNewReviewStatus =
    REVIEW_STATUSES.has(printifyOrder.status) &&
    printifyOrder.status !== dbOrder.printify_status;

  if (isNewReviewStatus) {
    await flagForReview(
      dbOrder,
      printifyOrder.status,
      `Printify reported status "${printifyOrder.status}"`
    );
  }

  await persistOrderUpdate(dbOrder.id, update, nowIso);

  if (update) {
    console.log(`Order ${dbOrder.id} updated:`, update);
  }

  return {
    updated: Boolean(update),
    flaggedForReview: isNewReviewStatus,
    rateLimited: false,
  };
}

/**
 * Sync order statuses from Printify
 *
 * Invoked by the pg_cron job `sync-printify-orders` every 5 minutes.
 * Fetches all orders that are not delivered/cancelled and have a
 * printify_order_id, reads their current state from the Printify API and
 * updates status, printify_status and tracking fields when they changed.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    const { userId } = await verifyAuth(authHeader);

    if (userId !== "service-role") {
      throw ErrorCodes.UNAUTHORIZED("sync-printify-orders is service-only");
    }

    const printifyToken = validateEnvVars.printifyToken();
    const printifyShopId = validateEnvVars.printifyShopId();

    console.log("=== SYNC PRINTIFY ORDERS ===");

    const ordersResult = await supabaseRest<SyncOrderRowI[]>(
      "orders?status=in.(waiting_confirmation,confirmed,processing,shipped)" +
        "&printify_order_id=not.is.null" +
        "&select=id,status,printify_status,printify_order_id,tracking_number,tracking_url,shipped_at,delivered_at" +
        "&order=printify_synced_at.asc.nullsfirst" +
        `&limit=${BATCH_SIZE}`,
      "GET"
    );

    if (ordersResult.error) {
      throw new Error(
        `Failed to fetch orders: ${JSON.stringify(ordersResult.error)}`
      );
    }

    const orders = ordersResult.data ?? [];
    console.log(`Found ${orders.length} orders to sync`);

    let checked = 0;
    let updated = 0;
    let flaggedForReview = 0;
    let rateLimited = false;
    const errors: Array<{ order_id: string; error: string }> = [];

    for (let i = 0; i < orders.length && !rateLimited; i += CONCURRENCY) {
      const chunk = orders.slice(i, i + CONCURRENCY);

      const outcomes = await Promise.all(
        chunk.map(async (order): Promise<SyncOutcomeI> => {
          try {
            return await syncOrder(order, printifyToken, printifyShopId);
          } catch (error) {
            console.error(`Failed to sync order ${order.id}:`, error);
            return {
              updated: false,
              flaggedForReview: false,
              rateLimited: false,
              error: String(error),
            };
          }
        })
      );

      for (const [index, outcome] of outcomes.entries()) {
        checked += 1;
        if (outcome.updated) updated += 1;
        if (outcome.flaggedForReview) flaggedForReview += 1;
        if (outcome.rateLimited) rateLimited = true;
        if (outcome.error) {
          errors.push({ order_id: chunk[index].id, error: outcome.error });
        }
      }
    }

    const skipped = checked - updated;

    console.log("=== SYNC PRINTIFY ORDERS COMPLETE ===");
    console.log({ checked, updated, skipped, flaggedForReview, rateLimited });

    return new Response(
      JSON.stringify({
        success: true,
        checked,
        updated,
        skipped,
        flaggedForReview,
        rateLimited,
        errors,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error syncing Printify orders:", error);
    return handleError(error, corsHeaders);
  }
});
