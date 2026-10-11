/**
 * One Printify order per application order.
 *
 * create-printify-order claims the order before calling Printify; the
 * primary key on order_fulfillment_claims makes a concurrent second request
 * fail with 409 ALREADY_FULFILLED instead of creating a duplicate order.
 */

import { FunctionError } from "./errors.ts";
import { supabaseRest } from "./supabase.ts";

export async function claimOrderFulfillment(orderId: string): Promise<void> {
  const result = await supabaseRest("order_fulfillment_claims", "POST", { order_id: orderId });
  // 23505: the order is already claimed (a missing order is a 23503 instead).
  if ((result.error as { code?: string } | null)?.code === "23505") {
    throw new FunctionError(409, "ALREADY_FULFILLED", "The order is already being sent to Printify");
  }
  if (result.error) throw new Error("Could not claim the order for fulfillment");
}

/** Printify rejected the order, so a later attempt may try again. */
export async function releaseOrderFulfillment(orderId: string): Promise<void> {
  const result = await supabaseRest(`order_fulfillment_claims?order_id=eq.${encodeURIComponent(orderId)}`, "DELETE");
  if (result.error) console.error("Could not release the fulfillment claim", { orderId });
}
