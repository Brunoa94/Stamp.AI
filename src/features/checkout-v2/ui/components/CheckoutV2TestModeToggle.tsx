/**
 * CheckoutV2TestModeToggle
 *
 * Developer test-mode switch, restyled to the luxury brutalist system so it
 * reads as part of the design rather than a bolted-on dev control. When on,
 * the Stripe card form swaps to predefined test payment methods.
 */

"use client";

import { FlaskConical } from "lucide-react";
import { Checkbox } from "@/features/ui/checkbox";
import { Label } from "@/features/ui/label";

interface CheckoutV2TestModePropsI {
  testMode: boolean;
  onTestModeChange: (value: boolean) => void;
}

export function CheckoutV2TestModeToggle({
  testMode,
  onTestModeChange,
}: CheckoutV2TestModePropsI) {
  return (
    <div className="flex items-center gap-3 border border-dashed border-(--color-stamp-warning)/40 bg-(--color-stamp-warning)/5 px-6 py-4">
      <FlaskConical
        className="h-4 w-4 text-(--color-stamp-warning)"
        aria-hidden="true"
      />
      <Checkbox
        id="testMode-v2"
        checked={testMode}
        onCheckedChange={(checked) => onTestModeChange(checked === true)}
      />
      <Label
        htmlFor="testMode-v2"
        className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-stamp-chocolate)"
      >
        Test Mode · use predefined payment methods
      </Label>
    </div>
  );
}
