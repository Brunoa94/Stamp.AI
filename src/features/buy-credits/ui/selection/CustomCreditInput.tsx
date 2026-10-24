"use client";

import { Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { Input } from "@/features/ui/input";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { MIN_CUSTOM_CREDITS, PRICE_PER_CREDIT } from "@/shared/constants/credits";

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
      <Label variant="section" className="mb-3 text-slate-500">{t("customLabel")}</Label>
      <Button
        type="button"
        variant="option-card"
        onClick={onFocus}
        aria-pressed={isSelected}
        className="w-full min-h-18 p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <CreditIcon isSelected={isSelected} />
          <div className="flex-1">
            <Input
              type="text"
              inputMode="numeric"
              placeholder={t("customPlaceholder", { min: MIN_CUSTOM_CREDITS })}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFocus}
              className="border-0 bg-transparent p-0 h-auto text-lg font-heading focus-visible:ring-0"
            />
          </div>
          {showPrice && (
            <Span variant="price" className="text-slate-600">€{price.toFixed(2)}</Span>
          )}
        </div>
        {showError && (
          <Paragraph variant="caption" className="text-red-500 mt-2">
            {t("customError", { min: MIN_CUSTOM_CREDITS })}
          </Paragraph>
        )}
      </Button>
    </div>
  );
}

function CreditIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center",
        isSelected ? "bg-[#7C3AED]/10" : "bg-slate-100"
      )}
    >
      <Coins
        className={cn(
          "w-5 h-5",
          isSelected ? "text-[#FF8C42]" : "text-slate-400"
        )}
      />
    </div>
  );
}
