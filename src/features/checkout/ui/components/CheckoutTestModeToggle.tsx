/**
 * CheckoutTestModeToggle
 *
 * Read-only test-mode indicator, styled to the luxury brutalist system. The
 * checkbox stays checked and disabled while NEXT_PUBLIC_CHECKOUT_TEST_MODE is on, so
 * shoppers can see the card form uses predefined test payment methods but
 * cannot switch modes.
 */

"use client";

import { useTranslations } from "next-intl";
import { FlaskConical } from "lucide-react";
import { Checkbox } from "@/features/ui/checkbox";
import { Label } from "@/features/ui/label";

interface CheckoutTestModePropsI {
  testMode: boolean;
}

export function CheckoutTestModeToggle({ testMode }: CheckoutTestModePropsI) {
  const t = useTranslations("checkout.testMode");
  return (
    <div className="flex items-center gap-3 border border-dashed border-(--color-stamp-warning)/40 bg-(--color-stamp-warning)/5 px-6 py-4">
      <FlaskConical
        className="h-4 w-4 text-(--color-stamp-warning)"
        aria-hidden="true"
      />
      <Checkbox
        id="testMode"
        checked={testMode}
        disabled
        className="rounded-none border-(--color-stamp-warning)/50 focus-visible:ring-(--color-stamp-warning) data-[state=checked]:border-(--color-stamp-warning) data-[state=checked]:bg-(--color-stamp-warning) data-[state=checked]:text-(--color-stamp-white)"
      />
      <Label
        htmlFor="testMode"
        className="text-base font-bold uppercase tracking-[0.2em] text-(--color-stamp-chocolate)"
      >
        {t("label")}
      </Label>
    </div>
  );
}
