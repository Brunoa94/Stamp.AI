import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import type { TrackOrderRequestT } from "@/shared/types/trackOrder";
import { lookupTrackedOrder, type TrackOrderResultT } from "../services/trackOrderService";

/**
 * A guest's order lookup on /track-order. It runs only when the form is
 * submitted (each lookup spends a rate-limited request, so it never refetches
 * on focus), and every submission sends a new one, even for the same order.
 *
 * `result` is the last finished lookup and stays on screen while the next
 * one runs. Refusals (unknown order, too many tries) are results; a network
 * failure is reported and shown as a failed lookup.
 */
export function useTrackOrder() {
  const { handleError } = useErrorHandler({ showToast: false });
  const [result, setResult] = useState<TrackOrderResultT | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (request: TrackOrderRequestT) => lookupTrackedOrder(request),
    onSuccess: setResult,
    onError: (error) => {
      handleError(error);
      setResult({ status: "error", error: "lookupFailed" });
    },
  });

  return { track: mutate, isTracking: isPending, result };
}
