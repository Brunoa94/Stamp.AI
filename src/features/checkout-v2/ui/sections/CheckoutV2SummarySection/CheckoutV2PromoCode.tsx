/**
 * CheckoutV2PromoCode
 *
 * Promo-code input restyled to the luxury brutalist system. Presentation
 * only — validation/state is owned by useCheckoutPricing upstream.
 */

"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Tag, X } from "lucide-react";
import { Input } from "@/features/ui/input";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";

interface CheckoutV2PromoCodePropsI {
  onApply: (code: string) => Promise<void>;
  onClear: () => void;
  appliedCode?: string;
  error?: string | null;
  isApplying?: boolean;
}

export function CheckoutV2PromoCode({
  onApply,
  onClear,
  appliedCode,
  error,
  isApplying = false,
}: CheckoutV2PromoCodePropsI) {
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
          Promo Code
        </Span>
      </div>

      {appliedCode ? (
        <div className="flex items-center justify-between border border-(--color-stamp-success)/30 bg-(--color-stamp-success)/5 px-4 py-3">
          <Span
            unstyled
            className="text-xs font-bold uppercase tracking-[0.2em] text-(--color-stamp-success)"
          >
            {appliedCode}
          </Span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            aria-label="Remove promo code"
            className="rounded-none text-(--color-stamp-success) hover:bg-(--color-stamp-success)/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="ENTER CODE"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
            disabled={isApplying}
            aria-label="Promo code"
            className="flex-1 rounded-none border-(--color-stamp-divider) uppercase tracking-[0.15em]"
          />
          <Button
            type="button"
            onClick={handleApply}
            disabled={!inputValue.trim() || isApplying}
            variant="outline"
            className="rounded-none border-(--color-stamp-chocolate) text-[11px] font-bold uppercase tracking-[0.2em]"
          >
            {isApplying ? "…" : "Apply"}
          </Button>
        </div>
      )}

      {error && (
        <Paragraph
          unstyled
          role="alert"
          className="text-[11px] font-bold uppercase tracking-[0.15em] text-(--color-stamp-error)"
        >
          {error}
        </Paragraph>
      )}
    </div>
  );
}
