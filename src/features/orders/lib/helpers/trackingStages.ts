import type { OrderT } from "@/shared/types/order";
import { getOrderDisplayStatus, type OrderDisplayStatusT } from "./statusPresentation";

/** The stages a guest follows on /track-order, in order. */
export const TRACKING_STAGES = ["placed", "inProduction", "shipped", "delivered"] as const;

type TrackingStageT =(typeof TRACKING_STAGES)[number];

/** Where an order stands: on a stage, or off the happy path. */
export type TrackingProgressT =
  | { kind: "active"; stageIndex: number }
  | { kind: "cancelled" }
  | { kind: "hasIssues" };

const STAGE_BY_DISPLAY_STATUS: Partial<Record<OrderDisplayStatusT, TrackingStageT>> = {
  processing: "placed",
  preparing: "placed",
  inProduction: "inProduction",
  shipped: "shipped",
  delivered: "delivered",
};

export function getTrackingProgress(
  order: Pick<OrderT, "status" | "printify_status">,
): TrackingProgressT {
  const displayStatus = getOrderDisplayStatus(order);
  if (displayStatus === "cancelled") return { kind: "cancelled" };
  if (displayStatus === "hasIssues") return { kind: "hasIssues" };

  const stage = STAGE_BY_DISPLAY_STATUS[displayStatus] ?? "placed";
  return { kind: "active", stageIndex: TRACKING_STAGES.indexOf(stage) };
}
