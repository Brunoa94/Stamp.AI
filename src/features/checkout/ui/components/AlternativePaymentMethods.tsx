import { useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";

import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import type { PaymentAlternativeMethodT } from "@/shared/types/payment";

interface Props {
  onSelectMethod: (method: PaymentAlternativeMethodT) => void;
}

export function AlternativePaymentMethods({ onSelectMethod }: Props) {
  const t = useTranslations("checkout.alternativeMethods");
  return (
    <div className="pt-4">
      <Span as="p" variant="label" className="mb-4 text-(--color-stamp-taupe)">
        {t("title")}
      </Span>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button
          type="button"
          variant="stamp-filter"
          onClick={() => onSelectMethod("paypal")}
          aria-label={t("paypalAria")}
        >
          {t("paypal")}
        </Button>
        <Button
          type="button"
          variant="stamp-filter"
          onClick={() => onSelectMethod("applepay")}
          aria-label={t("applePayAria")}
        >
          {t("applePay")}
        </Button>
        <Button
          type="button"
          variant="stamp-filter"
          onClick={() => onSelectMethod("stripe")}
          aria-label={t("cardAria")}
        >
          <CreditCard className="w-4 h-4" /> {t("card")}
        </Button>
      </div>
    </div>
  );
}
