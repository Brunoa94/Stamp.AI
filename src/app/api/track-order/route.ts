import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { consumeHashedRateLimit } from "@/lib/security/hashedRateLimit";
import { getClientIdentifier } from "@/lib/security/rate-limiter/utils";
import { captureError } from "@/lib/observability/errorCapture";
import { findTrackedOrder, parseTrackOrderRequest } from "@/lib/orders/trackOrder";
import type { TrackedOrderT, TrackOrderErrorT } from "@/shared/types/trackOrder";

export const runtime = "nodejs";

const HOUR_SECONDS = 60 * 60;
/** Per client IP: a guest checks an order a few times; enumeration needs thousands. */
const LOOKUPS_PER_IP_PER_HOUR = 30;
/** Per order number, across IPs: guessing the email for a known number. */
const LOOKUPS_PER_ORDER_PER_HOUR = 10;

type TrackOrderResponseT = { order: TrackedOrderT } | { error: TrackOrderErrorT };

function failed(error: TrackOrderErrorT, status: number): NextResponse<TrackOrderResponseT> {
  return NextResponse.json({ error }, { status });
}

/**
 * Looks up a guest's order by order number and email for /track-order.
 *
 * Orders are readable by the service role only for guests (they have no
 * session RLS could match), so the route proves the guest knows both the
 * number and the email, rate-limits the attempts, and answers a wrong email
 * exactly like an unknown order.
 */
export async function POST(request: NextRequest): Promise<NextResponse<TrackOrderResponseT>> {
  const input = parseTrackOrderRequest(await request.json().catch(() => null));
  if (!input) return failed("invalidRequest", 400);

  try {
    const supabase = createServiceClient();

    // Without a trusted client IP every guest would share one bucket, so the
    // per-IP limit is skipped (and logged); the per-order limit still applies.
    const clientIp = getClientIdentifier(request);
    if (clientIp === "unknown") {
      console.warn("[track-order] no trusted client IP; per-IP limit skipped");
    } else if (
      !(await consumeHashedRateLimit(supabase, "track-order:ip", clientIp, LOOKUPS_PER_IP_PER_HOUR, HOUR_SECONDS))
    ) {
      return failed("tooManyAttempts", 429);
    }

    if (
      !(await consumeHashedRateLimit(
        supabase,
        "track-order:order",
        input.orderNumber,
        LOOKUPS_PER_ORDER_PER_HOUR,
        HOUR_SECONDS,
      ))
    ) {
      return failed("tooManyAttempts", 429);
    }

    const order = await findTrackedOrder(supabase, input);
    if (!order) return failed("notFound", 404);

    return NextResponse.json({ order });
  } catch (error) {
    captureError(error, { service: "TrackOrderAPI", action: "lookupOrder" });
    return failed("lookupFailed", 500);
  }
}
