import { useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";

import { Button } from "@/features/ui/button";
import { paymentErrorTheme } from "@/theme/components";
import type { PaymentAlternativeMethodT } from "@/types/payment";

interface Props {
  onSelectMethod: (method: PaymentAlternativeMethodT) => void;
}

export function AlternativePaymentMethods({ onSelectMethod }: Props) {
  const t = useTranslations("checkout.alternativeMethods");
  return (
    <div className={paymentErrorTheme.altMethodsBlock}>
      <p className={paymentErrorTheme.altMethodsLabel}>
        {t("title")}
      </p>
      <div className={paymentErrorTheme.altMethodsGrid}>
        <Button
          type="button"
          variant="outline"
          className={paymentErrorTheme.altMethodBtn}
          onClick={() => onSelectMethod("paypal")}
          aria-label={t("paypalAria")}
        >
          {t("paypal")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={paymentErrorTheme.altMethodBtn}
          onClick={() => onSelectMethod("applepay")}
          aria-label={t("applePayAria")}
        >
          {t("applePay")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={paymentErrorTheme.altMethodBtn}
          onClick={() => onSelectMethod("stripe")}
          aria-label={t("cardAria")}
        >
          <CreditCard className="w-4 h-4" /> {t("card")}
        </Button>
      </div>
    </div>
  );
}
