import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";
import { OrdersLayout } from "./components/OrdersLayout";
import { TrackOrderHeader } from "./sections/TrackOrderHeader/TrackOrderHeader";
import { TrackOrderLookup } from "./sections/TrackOrderLookup/TrackOrderLookup";

/**
 * TrackOrderContent
 *
 * /track-order: a guest (or anyone without their account at hand) looks up
 * an order by its number and the checkout email, then sees its status,
 * shipment tracking, items and history. The confirmation email links here
 * with the order number filled in. The shell renders on the server; only
 * the lookup is a client component.
 */

interface PropsI {
  initialOrderNumber: string;
}

export function TrackOrderContent({ initialOrderNumber }: PropsI) {
  const t = useTranslations("orders.track");

  return (
    <OrdersLayout header={<TrackOrderHeader />}>
      <div className="mx-auto max-w-3xl space-y-8">
        <Paragraph variant="lead" className="text-(--color-stamp-chocolate)/80">
          {t("intro")}
        </Paragraph>

        <TrackOrderLookup initialOrderNumber={initialOrderNumber} />
      </div>
    </OrdersLayout>
  );
}
