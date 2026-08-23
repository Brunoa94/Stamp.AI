import { Check, Circle } from "lucide-react";
import { Span } from "@/features/ui/span";
import type { OrderStatusHistoryT } from "@/types/order";
import {
  toDisplayStatus,
  getStatusBadgeClass,
  getStatusLabel,
} from "../../../lib/helpers/statusPresentation";
import { formatTimestamp } from "../../../lib/helpers/formatTimestamp";

interface PropsI {
  entry: OrderStatusHistoryT;
  isLast: boolean;
  t: (key: string) => string;
}

export function TimelineEntry({ entry, isLast, t }: PropsI) {
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
