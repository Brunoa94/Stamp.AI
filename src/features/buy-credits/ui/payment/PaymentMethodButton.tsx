"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import type { PaymentMethodId, PaymentMethodOption } from "@/shared/constants/payment";
import {
  creditOptionCardVariants,
  creditOptionIconVariants,
} from "../../lib/variants/creditOptionVariants";
import { CreditSelectedCheck } from "../shared/CreditSelectedCheck";

interface PropsI {
  method: PaymentMethodOption;
  isSelected: boolean;
  onSelect: (method: PaymentMethodId) => void;
  disabled: boolean;
}

export function PaymentMethodButton({
  method,
  isSelected,
  onSelect,
  disabled,
}: PropsI) {
  const t = useTranslations("paymentMethods");

  return (
    <Button
      type="button"
      variant="unstyled"
      onClick={() => onSelect(method.id)}
      disabled={disabled}
      role="radio"
      aria-checked={isSelected}
      className={cn(
        creditOptionCardVariants({ selected: isSelected }),
        "flex flex-1 items-center gap-3 p-4",
      )}
    >
      <method.Icon
        className={cn("w-6 h-6", creditOptionIconVariants({ selected: isSelected }))}
      />
      <div className="flex flex-col text-left">
        <Label asChild variant="option" className="text-(--color-stamp-chocolate)">
          <Span unstyled>{t(`${method.id}.label`)}</Span>
        </Label>
        <Span variant="caption" className="text-(--color-stamp-taupe)">{t(`${method.id}.description`)}</Span>
      </div>
      {isSelected && <CreditSelectedCheck className="ml-auto shrink-0" />}
    </Button>
  );
}
