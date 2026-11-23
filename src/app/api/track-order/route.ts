import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { consumeHashedRateLimit } from "@/lib/security/hashedRateLimit";
import { getClientIdentifier } from "@/lib/security/rate-limiter/utils";
import { captureError } from "@/lib/observability/errorCapture";
import { createLogger } from "@/lib/observability/logger";
import { findTrackedOrder, parseTrackOrderRequest } from "@/lib/orders/trackOrder";
import type { TrackedOrderT, TrackOrderErrorT } from "@/shared/types/trackOrder";

export const runtime = "nodejs";

const HOUR_SECONDS = 60 * 60;
/** Per client IP: a guest checks an order a few times; enumeration needs thousands. */
const LOOKUPS_PER_IP_PER_HOUR = 30;
/** Wrong-email lookups for one order number before it is reported as a likely guessing attempt. */
const MISSES_PER_ORDER_BEFORE_ALERT = 10;

const logger = createLogger({ service: "TrackOrderAPI" });

type TrackOrderResponseT = { order: TrackedOrderT } | { error: TrackOrderErrorT };

function failed(error: TrackOrderErrorT, status: number): NextResponse<TrackOrderResponseT> {
  return NextResponse.json({ error }, { status });
}

/**
 * Looks up a guest's order by order number and email for /track-order.
 *
 * Orders are readable by the service role only for guests (they have no
 * session RLS could match), so the route proves the guest knows both the
 * number and the email, and answers a wrong email exactly like an unknown
 * order.
 *
 * The per-IP limit is the gate. Misses are also counted per order number,
 * but only reported (Sentry warning), never blocked: blocking a number
 * would let anyone who knows it lock the real customer out, and letting the
 * right email through a blocked number would tell a guesser when they hit.
 */
export async function POST(request: NextRequest): Promise<NextResponse<TrackOrderResponseT>> {
  const input = parseTrackOrderRequest(await request.json().catch(() => null));
  if (!input) return failed("invalidRequest", 400);

  try {
    const supabase = createServiceClient();

    // Without a trusted client IP every guest would share one bucket, so the
    // per-IP limit is skipped (and logged).
    const clientIp = getClientIdentifier(request);
    if (clientIp === "unknown") {
      logger.warn("No trusted client IP; per-IP limit skipped", { action: "lookupOrder" });
    } else if (
      !(await consumeHashedRateLimit(supabase, "track-order:ip", clientIp, LOOKUPS_PER_IP_PER_HOUR, HOUR_SECONDS))
    ) {
      return failed("tooManyAttempts", 429);
    }

    const order = await findTrackedOrder(supabase, input);
    if (order) return NextResponse.json({ order });

    const isUnderAlertLevel = await consumeHashedRateLimit(
      supabase,
      "track-order:miss",
      input.orderNumber,
      MISSES_PER_ORDER_BEFORE_ALERT,
      HOUR_SECONDS,
    );
    if (!isUnderAlertLevel) {
      captureError(
        new Error("Many failed order-tracking lookups for one order number"),
        { service: "TrackOrderAPI", action: "lookupOrder" },
        "warning",
      );
    }

    return failed("notFound", 404);
  } catch (error) {
    captureError(error, { service: "TrackOrderAPI", action: "lookupOrder" });
    return failed("lookupFailed", 500);
  }
}
