"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { Input } from "@/features/ui/input";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { MIN_CUSTOM_CREDITS, PRICE_PER_CREDIT } from "@/shared/constants/credits";
import { creditOptionCardVariants } from "../../lib/variants/creditOptionVariants";
import { CustomCreditIcon } from "./CustomCreditIcon";

interface CustomCreditInputProps {
  value: string;
  isSelected: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
}

export function CustomCreditInput({
  value,
  isSelected,
  onChange,
  onFocus,
}: CustomCreditInputProps) {
  const t = useTranslations("buyCredits.selection");
  const numericValue = parseInt(value) || 0;
  const price = numericValue * PRICE_PER_CREDIT;
  const showPrice = isSelected && numericValue >= MIN_CUSTOM_CREDITS;
  const showError = isSelected && numericValue > 0 && numericValue < MIN_CUSTOM_CREDITS;

  return (
    <div>
      <Label variant="section" className="mb-3 text-(--color-stamp-taupe)">{t("customLabel")}</Label>
      <Button
        type="button"
        variant="unstyled"
        onClick={onFocus}
        aria-pressed={isSelected}
        className={cn(
          creditOptionCardVariants({ selected: isSelected }),
          "block w-full min-h-18 p-4 text-left",
        )}
      >
        <div className="flex items-center gap-3">
          <CustomCreditIcon isSelected={isSelected} />
          <div className="flex-1">
            <Input
              type="text"
              inputMode="numeric"
              placeholder={t("customPlaceholder", { min: MIN_CUSTOM_CREDITS })}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFocus}
              className="border-0 bg-transparent p-0 h-auto text-lg font-heading text-(--color-stamp-chocolate) placeholder:text-(--color-stamp-taupe) shadow-none focus-visible:ring-0"
            />
          </div>
          {showPrice && (
            <Span variant="price" className="text-(--color-stamp-taupe)">€{price.toFixed(2)}</Span>
          )}
        </div>
        {showError && (
          <Paragraph variant="caption" className="text-(--color-stamp-error) mt-2">
            {t("customError", { min: MIN_CUSTOM_CREDITS })}
          </Paragraph>
        )}
      </Button>
    </div>
  );
}
