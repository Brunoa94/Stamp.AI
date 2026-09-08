import { supabaseRest } from "./supabase.ts";

export type OrderStatusHistorySourceT =
  | "printify_sync"
  | "order_creation"
  | "cancellation"
  | "backfill";

/**
 * Insert a status history record for an order.
 *
 * Should be called after successfully updating the order status to maintain
 * a complete audit trail for the order tracking timeline.
 */
export async function insertOrderStatusHistory(
  orderId: string,
  status: string,
  source: OrderStatusHistorySourceT,
  printifyStatus?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {
    order_id: orderId,
    status,
    source,
  };

  if (printifyStatus) {
    payload.printify_status = printifyStatus;
  }

  const result = await supabaseRest("order_status_history", "POST", payload);

  if (result.error) {
    // Log but don't throw - status history is non-critical and shouldn't
    // block the main order status update
    console.error(
      `Failed to insert order status history for order ${orderId}:`,
      result.error
    );
  }
}
