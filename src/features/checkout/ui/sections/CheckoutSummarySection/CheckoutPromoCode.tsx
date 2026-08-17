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
        <Tag className="h-4 w-4 text-(--color-stamp-chocolate)" aria-hidden="true" />
        <Span variant="label" className="text-(--color-stamp-chocolate)">
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
            className="flex-1 h-12 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream) px-4 text-base font-normal text-(--color-stamp-chocolate) placeholder:text-(--color-stamp-taupe)/50 focus-visible:border-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)/20"
          />
          <Button
            type="button"
            onClick={handleApply}
            disabled={!inputValue.trim() || isApplying}
            variant="primary"
            className="h-12 px-6 text-base font-bold uppercase tracking-wide"
          >
            {isApplying ? t("applying") : t("apply")}
          </Button>
        </div>
      )}

      {error && (
        <Paragraph
          unstyled
          role="alert"
          className="text-xs font-bold uppercase tracking-widest text-(--color-stamp-error)"
        >
          {error}
        </Paragraph>
      )}
    </div>
  );
}
