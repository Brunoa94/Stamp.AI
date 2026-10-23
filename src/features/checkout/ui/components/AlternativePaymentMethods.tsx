import { useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";

import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import type { PaymentAlternativeMethodT } from "@/shared/types/payment";

interface Props {
  onSelectMethod: (method: PaymentAlternativeMethodT) => void;
}

export function AlternativePaymentMethods({ onSelectMethod }: Props) {
  const t = useTranslations("checkout.alternativeMethods");
  return (
    <div className="pt-4">
      <Paragraph variant="eyebrow" className="mb-4 text-slate-400">
        {t("title")}
      </Paragraph>
      <div className="grid grid-cols-3 gap-3">
        <Button
          type="button"
          variant="payment-pill"
          onClick={() => onSelectMethod("paypal")}
          aria-label={t("paypalAria")}
        >
          {t("paypal")}
        </Button>
        <Button
          type="button"
          variant="payment-pill"
          onClick={() => onSelectMethod("applepay")}
          aria-label={t("applePayAria")}
        >
          {t("applePay")}
        </Button>
        <Button
          type="button"
          variant="payment-pill"
          onClick={() => onSelectMethod("stripe")}
          aria-label={t("cardAria")}
        >
          <CreditCard className="w-4 h-4" /> {t("card")}
        </Button>
      </div>
    </div>
  );
}
