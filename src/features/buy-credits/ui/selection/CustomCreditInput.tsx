"use client";

import { Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { Input } from "@/features/ui/input";
import { cn } from "@/lib/utils";
import { buyCreditsTheme } from "@/theme/components";
import { MIN_CUSTOM_CREDITS, PRICE_PER_CREDIT } from "@/constants/credits";

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
  const theme = buyCreditsTheme.customInput;
  const numericValue = parseInt(value) || 0;
  const price = numericValue * PRICE_PER_CREDIT;
  const showPrice = isSelected && numericValue >= MIN_CUSTOM_CREDITS;
  const showError = isSelected && numericValue > 0 && numericValue < MIN_CUSTOM_CREDITS;

  return (
    <div>
      <Label className={buyCreditsTheme.sectionLabel}>{t("customLabel")}</Label>
      <Button
        type="button"
        variant="outline"
        onClick={onFocus}
        className={cn(
          theme.container,
          isSelected ? theme.containerSelected : theme.containerUnselected
        )}
      >
        <div className={theme.row}>
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
            <span className={theme.price}>${price.toFixed(2)}</span>
          )}
        </div>
        {showError && (
          <p className={theme.error}>
            {t("customError", { min: MIN_CUSTOM_CREDITS })}
          </p>
        )}
      </Button>
    </div>
  );
}

function CreditIcon({ isSelected }: { isSelected: boolean }) {
  const theme = buyCreditsTheme.customInput;

  return (
    <div
      className={cn(
        theme.iconBox,
        isSelected ? theme.iconBoxSelected : theme.iconBoxUnselected
      )}
    >
      <Coins
        className={cn(
          "w-5 h-5",
          isSelected
            ? buyCreditsTheme.packageCard.creditsIconSelected
            : buyCreditsTheme.packageCard.creditsIconUnselected
        )}
      />
    </div>
  );
}
