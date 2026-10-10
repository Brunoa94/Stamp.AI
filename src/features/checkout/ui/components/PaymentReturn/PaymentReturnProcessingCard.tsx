import { Loader2 } from "lucide-react";
import { PaymentResultCard } from "../PaymentResultCard";
import { PaymentResultHeading } from "../PaymentResultHeading";

interface PropsI {
  ariaLabel: string;
  title: string;
  description: string;
}

export function PaymentReturnProcessingCard({
  ariaLabel,
  title,
  description,
}: PropsI) {
  return (
    <PaymentResultCard
      ariaLabel={ariaLabel}
      tone="pending"
      icon={<Loader2 className="w-12 h-12 animate-spin" />}
    >
      <PaymentResultHeading title={title} description={description} />
    </PaymentResultCard>
  );
}
