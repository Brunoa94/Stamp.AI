"use client";

import { useState } from "react";
import { Checkbox } from "@/features/ui/checkbox";
import { Label } from "@/features/ui/label";
import { Button } from "@/features/ui/button";
import { checkoutTheme } from "@/theme";

interface CheckoutMobileBillingStepProps {
  onComplete: () => void;
}

export function CheckoutMobileBillingStep({
  onComplete,
}: CheckoutMobileBillingStepProps) {
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const m = checkoutTheme.mobile;

  return (
    <div>
      <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-white/50 mb-1">
        <Checkbox
          id="mobile-same-as-shipping"
          checked={sameAsShipping}
          onCheckedChange={(checked: boolean) => setSameAsShipping(checked)}
        />
        <Label
          htmlFor="mobile-same-as-shipping"
          className="text-base font-medium text-slate-700 cursor-pointer"
        >
          Same as shipping address
        </Label>
      </div>

      {sameAsShipping && (
        <p className="text-sm text-slate-400 italic mb-1 px-1">
          Your billing details match your shipping address.
        </p>
      )}

      <Button onClick={onComplete} className={m.stepCta}>
        Proceed to Payment
      </Button>
    </div>
  );
}
