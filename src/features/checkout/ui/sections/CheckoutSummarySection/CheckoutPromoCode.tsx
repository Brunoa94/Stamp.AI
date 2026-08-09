/**
 * CheckoutPromoCode
 *
 * Promo-code input restyled to the luxury brutalist system. Presentation
 * only — validation/state is owned by useCheckoutPricing upstream.
 */


import { useState } from "react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Tag, X } from "lucide-react";
import { Input } from "@/features/ui/input";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";

interface CheckoutPromoCodePropsI {
  onApply: (code: string) => Promise<void>;
  onClear: () => void;
  appliedCode?: string;
  error?: string | null;
  isApplying?: boolean;
}

export function CheckoutPromoCode({
  onApply,
  onClear,
  appliedCode,
  error,
  isApplying = false,
}: CheckoutPromoCodePropsI) {
  const t = useTranslations("checkout.promoCode");
  const { setValue } = useFormContext<CheckoutFormData>();
  const [inputValue, setInputValue] = useState("");

  const handleApply = async () => {
    if (!inputValue.trim()) return;
    await onApply(inputValue.trim());
    setValue("promoCode", inputValue.trim());
  };

  const handleClear = () => {
    setInputValue("");
    setValue("promoCode", undefined);
    onClear();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-3.5 w-3.5 text-(--color-stamp-taupe)" aria-hidden="true" />
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("label")}
        </Span>
      </div>

      {appliedCode ? (
        <div className="flex items-center justify-between border border-(--color-stamp-success)/30 bg-(--color-stamp-success)/5 px-4 py-3">
          <Span
            unstyled
            className="text-lg font-bold uppercase tracking-[0.2em] text-(--color-stamp-success)"
          >
            {appliedCode}
          </Span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            aria-label={t("removeAria")}
            className="rounded-none text-(--color-stamp-success) hover:bg-(--color-stamp-success)/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={t("placeholder")}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
            disabled={isApplying}
            aria-label={t("inputAria")}
            className="flex-1 rounded-none border-(--color-stamp-divider) uppercase tracking-[0.15em]"
          />
          <Button
            type="button"
            onClick={handleApply}
            disabled={!inputValue.trim() || isApplying}
            variant="outline"
            className="rounded-none border-(--color-stamp-chocolate) text-xs font-bold uppercase tracking-[0.15em] px-4"
          >
            {isApplying ? t("applying") : t("apply")}
          </Button>
        </div>
      )}

      {error && (
        <Paragraph
          unstyled
          role="alert"
          className="text-lg font-bold uppercase tracking-[0.15em] text-(--color-stamp-error)"
        >
          {error}
        </Paragraph>
      )}
    </div>
  );
}
