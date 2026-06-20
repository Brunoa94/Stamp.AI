import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";

type BadgeVariantType = "order" | "payment" | "fulfillment";

interface PropsI {
  status: string;
  variant: BadgeVariantType;
}

const variantLabels: Record<BadgeVariantType, string> = {
  order: "Order",
  payment: "Payment",
  fulfillment: "Fulfillment",
};

function getListBadgeClass(status: string) {
  if (status === "delivered" || status === "shipped") {
    return "bg-cyan/5 border border-cyan/20 text-cyan";
  }
  if (status === "processing") {
    return "bg-purple/5 border border-purple/20 text-purple";
  }
  if (status === "cancelled") {
    return "bg-ink/5 border border-ink/10 text-ink/40";
  }

  return "bg-orange/5 border border-orange/20 text-orange";
}

export function OrderStatusBadge({ status, variant }: PropsI) {
  const normalizedStatus = status?.toLowerCase() || "processing";
  const colorClass = getListBadgeClass(normalizedStatus);
  const label = variantLabels[variant];

  return (
    <Span
      as="span"
      unstyled
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
        colorClass,
      )}
      role="status"
      aria-label={`${label} status: ${status}`}
    >
      <Span
        as="span"
        unstyled
        className="w-1.5 h-1.5 rounded-full bg-current"
      />
      {status || "Processing"}
    </Span>
  );
}
