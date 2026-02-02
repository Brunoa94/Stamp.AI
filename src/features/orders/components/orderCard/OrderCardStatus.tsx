import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderCardStatusProps {
  orderStatus: string | null | undefined;
  paymentStatus: string | null | undefined;
}

export function OrderCardStatus({
  orderStatus,
  paymentStatus,
}: OrderCardStatusProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {orderStatus && (
        <OrderStatusBadge status={orderStatus} variant="order" />
      )}
      {paymentStatus && (
        <OrderStatusBadge status={paymentStatus} variant="payment" />
      )}
    </div>
  );
}
