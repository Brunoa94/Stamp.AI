"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/features/ui/checkbox";
import { Label } from "@/features/ui/label";
import { CheckoutFormData } from "../../lib/context/CheckoutFormContext";

export function ShippingAddressToggle() {
  const { watch, setValue } = useFormContext<CheckoutFormData>();
  const useShippingAddress = watch("useShippingAddress");

  return (
    <div className="glass-card p-6 rounded-none">
      <div className="flex items-center space-x-3">
        <Checkbox
          id="useShippingAddress"
          checked={useShippingAddress}
          onCheckedChange={(checked) =>
            setValue("useShippingAddress", checked === true)
          }
          className="border-2 border-slate-300"
        />
        <Label
          htmlFor="useShippingAddress"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Ship to a different address
        </Label>
      </div>
    </div>
  );
}
