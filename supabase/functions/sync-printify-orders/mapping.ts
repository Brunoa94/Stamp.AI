/**
 * Pure mapping logic for the Printify order status sync.
 *
 * Kept free of Deno-specific imports so the Vitest suite in
 * src/tests/edge-functions/syncPrintifyOrders.test.ts can import it directly.
 */

export interface SyncOrderRowI {
  id: string;
  status: string | null;
  printify_status: string | null;
  printify_order_id: string;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface PrintifyShipmentI {
  carrier?: string;
  number?: string;
  url?: string;
  delivered_at?: string | null;
}

export interface PrintifyOrderI {
  id: string;
  status: string;
  shipments?: PrintifyShipmentI[];
}

export type OrderSyncUpdateT = Partial<{
  status: string;
  printify_status: string;
  tracking_number: string;
  tracking_url: string;
  shipped_at: string;
  delivered_at: string;
}>;

// Printify statuses that require manual review instead of a status transition
export const REVIEW_STATUSES = new Set([
  "has-issues",
  "unfulfillable",
  "source-check-failed",
]);

// Printify order status → application-level orders.status
export const PRINTIFY_TO_ORDER_STATUS: Record<string, string> = {
  "pending": "confirmed",
  "on-hold": "confirmed",
  "payment-not-received": "confirmed",
  "cost-calculation": "confirmed",
  "sending-to-production": "processing",
  "sending_to_production_delegate": "processing",
  "sending_to_production_delegate_sync": "processing",
  "in-production": "processing",
  "fulfilled": "shipped",
  "partially-fulfilled": "shipped",
  "canceled": "cancelled",
};

// The sync never moves an order backwards along this progression
const STATUS_RANK: Record<string, number> = {
  pending: 0,
  waiting_confirmation: 1,
  confirmed: 2,
  processing: 3,
  shipped: 4,
  delivered: 5,
};

function allShipmentsDelivered(shipments?: PrintifyShipmentI[]): boolean {
  if (!shipments || shipments.length === 0) return false;
  return shipments.every((shipment) => Boolean(shipment.delivered_at));
}

function latestDeliveredAt(shipments: PrintifyShipmentI[]): string {
  const timestamps = shipments
    .map((shipment) => shipment.delivered_at)
    .filter((value): value is string => Boolean(value));
  return timestamps.sort()[timestamps.length - 1];
}

/**
 * Compute the database update for an order given its current Printify state.
 *
 * Returns a diff object with only the changed fields, or null when nothing
 * changed. Never downgrades status along STATUS_RANK; review statuses
 * (REVIEW_STATUSES) record printify_status but leave orders.status untouched.
 */
export function mapPrintifyToOrderUpdate(
  dbOrder: SyncOrderRowI,
  printifyOrder: PrintifyOrderI,
  nowIso: string
): OrderSyncUpdateT | null {
  const update: OrderSyncUpdateT = {};

  if (printifyOrder.status !== dbOrder.printify_status) {
    update.printify_status = printifyOrder.status;
  }

  // Delivery is inferred from shipments: Printify has no "delivered" status
  const delivered = allShipmentsDelivered(printifyOrder.shipments);
  const mappedStatus = delivered
    ? "delivered"
    : PRINTIFY_TO_ORDER_STATUS[printifyOrder.status] ?? null;

  const currentRank = STATUS_RANK[dbOrder.status ?? ""] ?? 0;

  if (mappedStatus === "cancelled") {
    if (dbOrder.status !== "cancelled") update.status = "cancelled";
  } else if (mappedStatus && (STATUS_RANK[mappedStatus] ?? 0) > currentRank) {
    update.status = mappedStatus;
  }

  const shipment = printifyOrder.shipments?.[0];
  if (shipment?.number && shipment.number !== dbOrder.tracking_number) {
    update.tracking_number = shipment.number;
  }
  if (shipment?.url && shipment.url !== dbOrder.tracking_url) {
    update.tracking_url = shipment.url;
  }

  const effectiveStatus = update.status ?? dbOrder.status;
  if (
    !dbOrder.shipped_at &&
    (effectiveStatus === "shipped" || effectiveStatus === "delivered")
  ) {
    update.shipped_at = nowIso;
  }
  if (delivered && !dbOrder.delivered_at) {
    update.delivered_at = latestDeliveredAt(printifyOrder.shipments!);
  }

  return Object.keys(update).length > 0 ? update : null;
}
