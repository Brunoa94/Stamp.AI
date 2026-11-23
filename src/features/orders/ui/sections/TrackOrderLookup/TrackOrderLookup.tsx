"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { useTrackOrder } from "@/features/orders/lib/hooks/useTrackOrder";
import { TrackOrderForm } from "../TrackOrderForm/TrackOrderForm";
import { TrackOrderResult } from "../TrackOrderResult/TrackOrderResult";

/**
 * TrackOrderLookup
 *
 * The interactive part of /track-order: the lookup form and the order it
 * found. A found order is announced in one short line and receives focus,
 * so screen readers land on it without reading the whole order aloud.
 */

interface PropsI {
  initialOrderNumber: string;
}

export function TrackOrderLookup({ initialOrderNumber }: PropsI) {
  const t = useTranslations("orders.track.result");
  const { track, isTracking, result } = useTrackOrder();
  const resultRef = useRef<HTMLDivElement>(null);
  const foundOrder = result?.status === "found" ? result.order : null;

  // Move focus to each newly found order
  useEffect(() => {
    if (foundOrder) resultRef.current?.focus();
  }, [foundOrder]);

  return (
    <>
      <TrackOrderForm
        initialOrderNumber={initialOrderNumber}
        isLooking={isTracking}
        error={!isTracking && result?.status === "error" ? result.error : null}
        onSubmit={track}
      />

      <Span unstyled role="status" className="sr-only">
        {foundOrder ? t("found", { number: foundOrder.order_number }) : ""}
      </Span>

      {foundOrder && (
        <div ref={resultRef} tabIndex={-1} className="outline-none">
          <TrackOrderResult order={foundOrder} />
        </div>
      )}
    </>
  );
}
