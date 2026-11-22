import type {
  TrackedOrderT,
  TrackOrderErrorT,
  TrackOrderRequestT,
} from "@/shared/types/trackOrder";

/**
 * A guest's order lookup. Expected refusals (unknown order, too many tries)
 * come back as a result for the form to show inline; only a network failure
 * throws.
 */
export type TrackOrderResultT =
  | { status: "found"; order: TrackedOrderT }
  | { status: "error"; error: TrackOrderErrorT };

const TRACK_ORDER_ERRORS: ReadonlySet<string> = new Set<TrackOrderErrorT>([
  "invalidRequest",
  "notFound",
  "tooManyAttempts",
  "lookupFailed",
]);

function isTrackOrderError(value: unknown): value is TrackOrderErrorT {
  return typeof value === "string" && TRACK_ORDER_ERRORS.has(value);
}

export async function lookupTrackedOrder(request: TrackOrderRequestT): Promise<TrackOrderResultT> {
  const response = await fetch("/api/track-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const body = (await response.json().catch(() => null)) as
    | { order?: TrackedOrderT; error?: unknown }
    | null;

  if (response.ok && body?.order) return { status: "found", order: body.order };

  return { status: "error", error: isTrackOrderError(body?.error) ? body.error : "lookupFailed" };
}
