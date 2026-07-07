import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";
import { getOrderStatusConfig } from "../../helpers/getOrderStatusConfig";
import { OrderStatusType } from "../../types/orders-terminal";

const KNOWN_STATUSES = [
  "delivered",
  "shipped",
  "processing",
  "cancelled",
] as const;

interface PropsI {
  status: string | null | undefined;
  /** Renders the status icon instead of the color dot */
  showIcon?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * Single source of truth for order status pills across list, grid,
 * mobile and detail views. Colors come from getOrderStatusConfig so the
 * mapping lives in one place.
 */
export function OrderStatusBadge({
  status,
  showIcon = false,
  ariaLabel,
  className,
}: PropsI) {
  const normalized = (status ?? "").toLowerCase() as OrderStatusType;
  const isKnown = KNOWN_STATUSES.includes(
    normalized as (typeof KNOWN_STATUSES)[number],
  );
  const config = getOrderStatusConfig(isKnown ? normalized : undefined);
  const StatusIcon = config.icon;
  const label = isKnown ? config.label : status || "Processing";

  return (
    <Span
      as="span"
      unstyled
      role="status"
      aria-label={ariaLabel ?? `Status: ${label}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
        config.badgeClass,
        className,
      )}
    >
      {showIcon ? (
        <StatusIcon className="h-3 w-3" />
      ) : (
        <Span
          as="span"
          unstyled
          className="h-1.5 w-1.5 rounded-full bg-current"
        />
      )}
      {label}
    </Span>
  );
}
