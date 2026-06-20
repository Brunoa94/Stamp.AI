"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Tag, X } from "lucide-react";
import { Input } from "@/features/ui/input";
import { Button } from "@/features/ui/button";
import type { CheckoutFormData } from "../../lib/context/CheckoutFormContext";

interface PromoCodeInputProps {
  onApply: (code: string) => Promise<void>;
  onClear: () => void;
  appliedCode?: string;
  error?: string | null;
  isApplying?: boolean;
}

export function PromoCodeInput({
  onApply,
  onClear,
  appliedCode,
  error,
  isApplying = false,
}: PromoCodeInputProps) {
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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Promo Code</span>
      </div>

      {appliedCode ? (
        // Applied promo code display
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">{appliedCode}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 w-6 p-0 hover:bg-green-100"
          >
            <X className="w-4 h-4 text-green-700" />
          </Button>
        </div>
      ) : (
        // Promo code input
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter code"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
            disabled={isApplying}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleApply}
            disabled={!inputValue.trim() || isApplying}
            variant="outline"
          >
            {isApplying ? "Applying..." : "Apply"}
          </Button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
