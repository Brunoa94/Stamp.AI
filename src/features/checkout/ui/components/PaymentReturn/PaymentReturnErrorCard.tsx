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
  retryLabel: string;
  dashboardLabel: string;
  onRetry: () => void;
}

/** Non-retryable system error after a payment return, with recovery paths. */
export function PaymentReturnErrorCard({
  ariaLabel,
  title,
  description,
  retryLabel,
  dashboardLabel,
  onRetry,
}: PropsI) {
  return (
    <PaymentResultCard
      ariaLabel={ariaLabel}
      tone="error"
      icon={<AlertCircle className="w-12 h-12" />}
    >
      <PaymentResultHeading
        title={title}
        description={description}
        className="mb-12"
      />
      <PaymentResultActions>
        <Button onClick={onRetry} variant="primary" className="w-full">
          {retryLabel}
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href={PAYMENT_RETURN_ROUTES.dashboard}>{dashboardLabel}</Link>
        </Button>
      </PaymentResultActions>
    </PaymentResultCard>
  );
}
