import { CreditCard } from "lucide-react";
import { Paragraph } from "@/features/ui/paragraph";

interface PaymentMethodCardPropsI {
  paymentMethod: string;
}

export function PaymentMethodCard({ paymentMethod }: PaymentMethodCardPropsI) {
  return (
    <div className="flex items-center gap-3 border border-ink/10 bg-white p-4">
      <CreditCard className="h-5 w-5 text-ink/70" />
      <div>
        <Paragraph
          as="p"
          variant="sm"
          className="text-[10px] font-bold tracking-[0.25em] text-ink/45"
        >
          Payment Method
        </Paragraph>
        <Paragraph
          as="p"
          variant="body"
          className="font-medium capitalize tracking-wide text-ink"
        >
          {paymentMethod}
        </Paragraph>
      </div>
    </div>
  );
}
