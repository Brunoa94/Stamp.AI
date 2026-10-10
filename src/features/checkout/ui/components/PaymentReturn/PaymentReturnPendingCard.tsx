import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { PaymentResultActions } from "../PaymentResultActions";
import { PaymentResultCard } from "../PaymentResultCard";
import { PaymentResultHeading } from "../PaymentResultHeading";
import { PAYMENT_RETURN_ROUTES } from "@/features/checkout/lib/constants/paymentReturn";
import { Button } from "@/features/ui/button";

interface PropsI {
  ariaLabel: string;
  title: string;
  description: string;
  viewOrdersLabel: string;
  dashboardLabel: string;
}

/** Payment accepted by the provider but not yet confirmed. */
export function PaymentReturnPendingCard({
  ariaLabel,
  title,
  description,
  viewOrdersLabel,
  dashboardLabel,
}: PropsI) {
  return (
    <PaymentResultCard
      ariaLabel={ariaLabel}
      tone="pending"
      icon={<AlertCircle className="w-12 h-12" />}
    >
      <PaymentResultHeading
        title={title}
        description={description}
        className="mb-12"
      />
      <PaymentResultActions>
        <Button asChild variant="primary" className="w-full">
          <Link href={PAYMENT_RETURN_ROUTES.orders}>{viewOrdersLabel}</Link>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href={PAYMENT_RETURN_ROUTES.dashboard}>{dashboardLabel}</Link>
        </Button>
      </PaymentResultActions>
    </PaymentResultCard>
  );
}
