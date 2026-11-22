"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";
import { useTrackOrder } from "../lib/hooks/useTrackOrder";
import type { TrackOrderErrorT, TrackOrderRequestT } from "@/shared/types/trackOrder";
import { OrdersLayout } from "./components/OrdersLayout";
import { TrackOrderHeader } from "./sections/TrackOrderHeader/TrackOrderHeader";
import { TrackOrderForm } from "./sections/TrackOrderForm/TrackOrderForm";
import { TrackOrderResult } from "./sections/TrackOrderResult/TrackOrderResult";

/**
 * TrackOrderContent
 *
 * /track-order: a guest (or anyone without their account at hand) looks up
 * an order by its number and the checkout email, then sees its status,
 * shipment tracking, items and history. The confirmation email links here
 * with the order number filled in.
 */

interface PropsI {
  initialOrderNumber: string;
}

export function TrackOrderContent({ initialOrderNumber }: PropsI) {
  const t = useTranslations("orders.track");
  const [request, setRequest] = useState<TrackOrderRequestT | null>(null);
  const { data, isFetching, isError } = useTrackOrder(request);

  const error: TrackOrderErrorT | null = isError
    ? "lookupFailed"
    : data?.status === "error"
      ? data.error
      : null;

  return (
    <OrdersLayout header={<TrackOrderHeader />}>
      <div className="mx-auto max-w-3xl space-y-8">
        <Paragraph variant="lead" className="text-(--color-stamp-chocolate)/80">
          {t("intro")}
        </Paragraph>

        <TrackOrderForm
          initialOrderNumber={initialOrderNumber}
          isLooking={isFetching}
          error={isFetching ? null : error}
          onSubmit={setRequest}
        />

        {/* Announces the found order to screen readers */}
        <div aria-live="polite">
          {!isFetching && data?.status === "found" && <TrackOrderResult order={data.order} />}
        </div>
      </div>
    </OrdersLayout>
  );
}
