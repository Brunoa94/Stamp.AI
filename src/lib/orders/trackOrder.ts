import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database.types";
import type {
  TrackedOrderHistoryEntryT,
  TrackedOrderItemT,
  TrackedOrderT,
  TrackOrderRequestT,
} from "@/shared/types/trackOrder";

/**
 * Guest order lookup for /track-order: an order is shown to whoever knows
 * both its number and the email it was placed with. Runs with the service
 * client (guests have no session that RLS could match), so it returns only
 * the fields in TrackedOrderT and treats a wrong email exactly like an
 * unknown order.
 */

// Generated order numbers look like ORD-20261122-0042; the pattern also keeps
// PostgREST filter syntax out of the query.
const ORDER_NUMBER_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,39}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

// Unpaid drafts and failed payments are not orders to track yet
const TRACKABLE_PAYMENT_STATUSES = new Set(["paid", "refunded"]);

const TRACKED_ORDER_COLUMNS =
  "id, order_number, customer_email, payment_status, created_at, status, printify_status, currency, subtotal, discount_amount, shipping_cost, total_amount, tracking_number, tracking_url, shipped_at, delivered_at";

export function parseTrackOrderRequest(body: unknown): TrackOrderRequestT | null {
  if (typeof body !== "object" || body === null) return null;

  const { orderNumber, email } = body as Record<string, unknown>;
  if (typeof orderNumber !== "string" || typeof email !== "string") return null;

  const normalizedNumber = orderNumber.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();
  if (!ORDER_NUMBER_PATTERN.test(normalizedNumber)) return null;
  if (normalizedEmail.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(normalizedEmail)) return null;

  return { orderNumber: normalizedNumber, email: normalizedEmail };
}

export async function findTrackedOrder(
  supabase: SupabaseClient<Database>,
  { orderNumber, email }: TrackOrderRequestT,
): Promise<TrackedOrderT | null> {
  const { data: order, error } = await supabase
    .from("orders")
    .select(TRACKED_ORDER_COLUMNS)
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) throw new Error(`Order lookup failed: ${error.message}`);

  if (!order || order.customer_email.trim().toLowerCase() !== email) return null;
  if (!order.payment_status || !TRACKABLE_PAYMENT_STATUSES.has(order.payment_status)) return null;

  const [items, history] = await Promise.all([
    supabase
      .from("order_items")
      .select("product_name, variant_name, quantity, total_price, custom_image_url")
      .eq("order_id", order.id),
    supabase
      .from("order_status_history")
      .select("status, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
  ]);
  if (items.error) throw new Error(`Order items lookup failed: ${items.error.message}`);
  if (history.error) throw new Error(`Order history lookup failed: ${history.error.message}`);

  // Drop the lookup-only columns: the id and the customer's email stay server-side
  const { id: _id, customer_email: _email, ...tracked } = order;
  return {
    ...tracked,
    items: (items.data ?? []) as TrackedOrderItemT[],
    history: (history.data ?? []) as TrackedOrderHistoryEntryT[],
  };
}
