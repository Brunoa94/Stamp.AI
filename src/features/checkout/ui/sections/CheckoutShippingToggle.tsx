/**
 * CheckoutShippingToggle
 *
 * Toggle for shipping to a separate address. Reuses the checkout form
 * context and the design-system Checkbox, styled to the luxury system.
 */

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/features/ui/checkbox";
import { Label } from "@/features/ui/label";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";

export function CheckoutShippingToggle() {
  const t = useTranslations("checkout.shipping");
  const { watch, setValue } = useFormContext<CheckoutFormData>();
  const useShippingAddress = watch("useShippingAddress");

  return (
    <div className="flex items-center gap-3 border border-(--color-stamp-divider) bg-(--color-stamp-white) px-6 py-5">
      <Checkbox
        id="useShippingAddress"
        checked={useShippingAddress}
        onCheckedChange={(checked) =>
          setValue("useShippingAddress", checked === true)
        }
        className="rounded-none border-(--color-stamp-divider) focus-visible:ring-(--color-stamp-gold) data-[state=checked]:border-(--color-stamp-gold) data-[state=checked]:bg-(--color-stamp-gold) data-[state=checked]:text-(--color-stamp-white)"
      />
      <Label
        htmlFor="useShippingAddress"
        className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.2em] text-(--color-stamp-chocolate)"
      >
        {t("toggleLabel")}
      </Label>
    </div>
  );
}
