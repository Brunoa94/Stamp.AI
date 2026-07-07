import { OrderStatusBadge as SharedOrderStatusBadge } from "../../OrderStatusBadge";

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

export function OrderStatusBadge({ status, variant }: PropsI) {
  return (
    <SharedOrderStatusBadge
      status={status}
      ariaLabel={`${variantLabels[variant]} status: ${status}`}
    />
  );
}
