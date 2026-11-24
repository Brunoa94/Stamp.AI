/**
 * CheckoutShippingToggle
 *
 * Toggle for shipping to a separate address: a row in the shared card style
 * with the stamp Checkbox (the same as the cart's selection boxes). Reuses
 * the checkout form context.
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
    <div className="flex items-center gap-4 rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) px-6 py-5 shadow-(--shadow-stamp-card)">
      <Checkbox
        id="useShippingAddress"
        variant="stamp"
        checked={useShippingAddress}
        onCheckedChange={(checked) =>
          setValue("useShippingAddress", checked === true)
        }
      />
      <Label
        htmlFor="useShippingAddress"
        className="cursor-pointer text-base text-(--color-stamp-chocolate)"
      >
        {t("toggleLabel")}
      </Label>
    </div>
  );
}
