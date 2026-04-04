import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { componentThemes } from "@/theme/components";
import clsx from "clsx";
import { useState } from "react";

interface PromoCodeSectionProps {
  onPromoCodeApply?: (code: string) => void;
}

export const PromoCodeSection = ({ onPromoCodeApply }: PromoCodeSectionProps) => {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setPromoApplied(true);
      onPromoCodeApply?.(promoCode);
      // TODO: Implement promo code validation and discount calculation
    }
  };

  return (
    <div className="mb-6 pb-6 border-b border-purple-100">
      <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-2">
        Promo Code
      </label>
      <div className="flex gap-2">
        <Input
          id="promo-code"
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          disabled={promoApplied}
          className={clsx(componentThemes.input.base, "flex-1")}
        />
        <Button
          type="button"
          onClick={handleApplyPromo}
          disabled={!promoCode.trim() || promoApplied}
          className={clsx(
            "px-4 py-2 text-sm font-medium",
            promoApplied
              ? "bg-green-100 text-green-700 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700"
          )}
        >
          {promoApplied ? "Applied" : "Apply"}
        </Button>
      </div>
      {promoApplied && (
        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
          <span>✓</span>
          <span>Promo code applied (feature coming soon)</span>
        </p>
      )}
    </div>
  );
};
