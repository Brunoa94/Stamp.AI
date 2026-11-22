import { useLocale, useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { List } from "@/features/ui/list";
import { Span } from "@/features/ui/span";
import { getTrackingProgress } from "@/features/orders/lib/helpers/trackingStages";
import { formatOrderDate } from "@/features/orders/lib/utils/formatOrderDate";
import type { TrackedOrderT } from "@/shared/types/trackOrder";
import { TimelineEntry } from "../../components/OrdersDetailsModal/TimelineEntry";
import { TrackOrderProgress } from "./TrackOrderProgress";
import { TrackOrderItems } from "./TrackOrderItems";
import { TrackOrderTotals } from "./TrackOrderTotals";

/**
 * TrackOrderResult
 *
 * A guest's looked-up order: its progress, the carrier tracking once it
 * ships, the items and totals, and the status history.
 */

interface PropsI {
  order: TrackedOrderT;
}

export function TrackOrderResult({ order }: PropsI) {
  const t = useTranslations("orders.track.result");
  const tStatus = useTranslations("orders.statusBadge");
  const tTimeline = useTranslations("orders.timeline");
  const locale = useLocale();

  return (
    <article
      aria-label={t("orderNumber", { number: order.order_number })}
      className="space-y-8 rounded-lg border border-(--color-stamp-divider) bg-(--color-stamp-white) p-6 shadow-sm md:p-8"
    >
      <header className="space-y-1">
        <Heading as="h2" variant="section" className="text-(--color-stamp-chocolate)">
          {t("orderNumber", { number: order.order_number })}
        </Heading>
        <Span variant="meta" className="block text-(--color-stamp-taupe)">
          {t("placedOn", { date: formatOrderDate(order.created_at, locale) })}
        </Span>
      </header>

      <section aria-label={t("statusTitle")}>
        <TrackOrderProgress progress={getTrackingProgress(order)} />
      </section>

      {order.tracking_number && (
        <div className="flex flex-col gap-2 rounded-lg bg-(--color-stamp-cream) p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Span variant="label" className="block text-(--color-stamp-gold-text)">
              {t("trackingNumber")}
            </Span>
            <Span variant="default" className="font-mono text-(--color-stamp-chocolate)">
              {order.tracking_number}
            </Span>
          </div>
          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-(--color-stamp-chocolate) underline-offset-4 hover:text-(--color-stamp-gold-text) hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)"
            >
              {t("trackPackage")}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      )}

      <section aria-labelledby="tracked-order-items" className="grid gap-8 md:grid-cols-2">
        <div>
          <Span variant="label" id="tracked-order-items" className="block border-b border-(--color-stamp-divider) pb-2 text-(--color-stamp-gold-text)">
            {t("items")}
          </Span>
          <TrackOrderItems items={order.items} />
          <TrackOrderTotals order={order} />
        </div>

        {order.history.length > 0 && (
          <div>
            <Span variant="label" className="mb-4 block border-b border-(--color-stamp-divider) pb-2 text-(--color-stamp-gold-text)">
              {tTimeline("title")}
            </Span>
            <div className="relative pl-6">
              <div className="absolute left-1.75 top-2 bottom-2 w-px bg-(--color-stamp-divider)" />
              <List className="space-y-4">
                {order.history.map((entry, index) => (
                  <TimelineEntry
                    key={`${entry.status}-${entry.created_at}`}
                    entry={entry}
                    isLast={index === order.history.length - 1}
                    t={tStatus}
                  />
                ))}
              </List>
            </div>
          </div>
        )}
      </section>
    </article>
  );
}
