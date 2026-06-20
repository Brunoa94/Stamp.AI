import { DetailItem } from "./DetailItem";
import { StatusBadge } from "./StatusBadge";

interface PaymentSuccessDetailsGridProps {
  orderNumber: string;
  estimatedDelivery: string;
  totalPaid: string;
  status?: string;
}

/**
 * PaymentSuccessDetailsGrid - Grid display of payment success details
 * Shows order number, delivery estimate, total paid, and status
 */
export function PaymentSuccessDetailsGrid({
  orderNumber,
  estimatedDelivery,
  totalPaid,
  status = "Processing",
}: PaymentSuccessDetailsGridProps) {
  return (
    <div
      className="grid grid-cols-2 gap-8 text-left border-y border-slate-100 py-8 mb-12"
      aria-live="polite"
    >
      <DetailItem label="Order Number" value={orderNumber} />
      <DetailItem label="Estimated Delivery" value={estimatedDelivery} />
      <DetailItem label="Total Paid" value={totalPaid} />
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Status
        </span>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
