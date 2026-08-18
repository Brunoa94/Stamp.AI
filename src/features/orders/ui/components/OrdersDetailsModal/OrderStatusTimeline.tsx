import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Span } from "@/features/ui/span";
import { useOrderStatusHistory } from "@/queries/orderQueries";
import { TimelineEntry } from "./TimelineEntry";

interface PropsI {
  orderId: string;
}

export function OrderStatusTimeline({ orderId }: PropsI) {
  const t = useTranslations("orders.statusBadge");
  const tTimeline = useTranslations("orders.timeline");
  const { data: history, isLoading, error } = useOrderStatusHistory(orderId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-(--color-stamp-taupe)" />
      </div>
    );
  }

  if (error || !history || history.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <Span
        variant="label"
        className="mb-4 block border-b border-(--color-stamp-divider) pb-2 text-(--color-stamp-gold)"
      >
        {tTimeline("title")}
      </Span>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-(--color-stamp-divider)" />

        <ul className="space-y-4">
          {history.map((entry, index) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              isLast={index === history.length - 1}
              t={t}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
