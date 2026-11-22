import { useQuery } from "@tanstack/react-query";
import type { TrackOrderRequestT } from "@/shared/types/trackOrder";
import { lookupTrackedOrder } from "../services/trackOrderService";

/**
 * The order a guest looked up on /track-order. Idle until the form is
 * submitted (`request` is null); a new submission is a new lookup. Refusals
 * come back as data, so they are not retried.
 */
export function useTrackOrder(request: TrackOrderRequestT | null) {
  return useQuery({
    queryKey: ["trackOrder", request?.orderNumber, request?.email],
    queryFn: () => lookupTrackedOrder(request!),
    enabled: request !== null,
    staleTime: 60_000,
    retry: false,
  });
}
