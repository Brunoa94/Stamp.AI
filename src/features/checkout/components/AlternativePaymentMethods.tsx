import { CreditCard } from "lucide-react";

import { Button } from "@/features/ui/button";
import { paymentErrorTheme } from "@/theme/components";
import type { PaymentAlternativeMethodT } from "@/types/payment";

interface Props {
  onSelectMethod: (method: PaymentAlternativeMethodT) => void;
}

export function AlternativePaymentMethods({ onSelectMethod }: Props) {
  return (
    <div className={paymentErrorTheme.altMethodsBlock}>
      <p className={paymentErrorTheme.altMethodsLabel}>
        Try Alternative Method
      </p>
      <div className={paymentErrorTheme.altMethodsGrid}>
        <Button
          type="button"
          variant="outline"
          className={paymentErrorTheme.altMethodBtn}
          onClick={() => onSelectMethod("paypal")}
          aria-label="Pay with PayPal"
        >
          PayPal
        </Button>
        <Button
          type="button"
          variant="outline"
          className={paymentErrorTheme.altMethodBtn}
          onClick={() => onSelectMethod("applepay")}
          aria-label="Pay with Apple Pay"
        >
          Apple Pay
        </Button>
        <Button
          type="button"
          variant="outline"
          className={paymentErrorTheme.altMethodBtn}
          onClick={() => onSelectMethod("stripe")}
          aria-label="Pay with card"
        >
          <CreditCard className="w-4 h-4" /> Card
        </Button>
      </div>
    </div>
  );
}
