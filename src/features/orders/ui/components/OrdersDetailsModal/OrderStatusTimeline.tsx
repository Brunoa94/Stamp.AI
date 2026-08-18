import { useTranslations } from "next-intl";
import { Check, Circle, Loader2 } from "lucide-react";
import { Span } from "@/features/ui/span";
import { useOrderStatusHistory } from "@/queries/orderQueries";
import type { OrderStatusHistoryT } from "@/types/order";
import { toDisplayStatus, getStatusBadgeClass } from "../../../lib/helpers/statusPresentation";

interface PropsI {
  orderId: string;
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string, t: (key: string) => string): string {
  const displayStatus = toDisplayStatus(status);
  return t(displayStatus) || status;
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

interface TimelineEntryPropsI {
  entry: OrderStatusHistoryT;
  isLast: boolean;
  t: (key: string) => string;
}

function TimelineEntry({ entry, isLast, t }: TimelineEntryPropsI) {
  const displayStatus = toDisplayStatus(entry.status);
  const isTerminal = displayStatus === "delivered" || displayStatus === "cancelled";

  return (
    <li className="relative flex items-start gap-3">
      {/* Status indicator */}
      <div className="relative z-10 -ml-6 flex h-4 w-4 items-center justify-center">
        {isTerminal ? (
          <div
            className={`flex h-4 w-4 items-center justify-center rounded-full ${
              displayStatus === "delivered"
                ? "bg-(--color-stamp-success)"
                : "bg-(--color-stamp-error)"
            }`}
          >
            <Check className="h-2.5 w-2.5 text-(--color-stamp-white)" />
          </div>
        ) : isLast ? (
          <Circle className="h-4 w-4 fill-(--color-stamp-gold) text-(--color-stamp-gold)" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-(--color-stamp-taupe)" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-1">
        <Span
          variant="badge"
          className={`inline-flex rounded-full px-2 py-0.5 ${getStatusBadgeClass(displayStatus)}`}
        >
          {getStatusLabel(entry.status, t)}
        </Span>
        <Span
          variant="meta"
          className="mt-1 block text-(--color-stamp-taupe)"
        >
          {formatTimestamp(entry.created_at)}
        </Span>
      </div>
    </li>
  );
}
