import { paymentSuccessTheme } from "@/theme/components";

interface Props {
  orderNumber: string;
  estimatedDelivery: string;
  totalPaid: string;
  status?: string;
}

export function PaymentSuccessDetailsGrid({
  orderNumber,
  estimatedDelivery,
  totalPaid,
  status = "Processing",
}: Props) {
  return (
    <div className={paymentSuccessTheme.grid} aria-live="polite">
      <div className={paymentSuccessTheme.gridItem}>
        <span className={paymentSuccessTheme.gridLabel}>Order Number</span>
        <span className={paymentSuccessTheme.gridValue}>{orderNumber}</span>
      </div>
      <div className={paymentSuccessTheme.gridItem}>
        <span className={paymentSuccessTheme.gridLabel}>Estimated Delivery</span>
        <span className={paymentSuccessTheme.gridValue}>{estimatedDelivery}</span>
      </div>
      <div className={paymentSuccessTheme.gridItem}>
        <span className={paymentSuccessTheme.gridLabel}>Total Paid</span>
        <span className={paymentSuccessTheme.gridValue}>{totalPaid}</span>
      </div>
      <div className={paymentSuccessTheme.gridItem}>
        <span className={paymentSuccessTheme.gridLabel}>Status</span>
        <div className={paymentSuccessTheme.statusBadge}>
          <span className={paymentSuccessTheme.statusDot} aria-hidden="true" />
          <span className={paymentSuccessTheme.statusText}>{status}</span>
        </div>
      </div>
    </div>
  );
}
