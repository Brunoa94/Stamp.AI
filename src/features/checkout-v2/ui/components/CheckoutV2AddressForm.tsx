/**
 * CheckoutV2AddressForm
 *
 * Address form styled in the luxury brutalist system. Composes the shared
 * design-system Input/Select/Label with stamp tokens (chocolate text, cream
 * surfaces, taupe labels, gold focus) rather than the neutral defaults.
 * Reuses the shared shippingFormConfig and the checkout form context so no
 * validation or field logic is duplicated.
 */

"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import { shippingFormConfig, type FieldRow } from "@/constants/shippingFormConfig";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";

interface CheckoutV2AddressFormPropsI {
  fieldPrefix: "billing" | "shipping";
  config?: FieldRow[];
}

const LABEL_CLASS =
  "text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-stamp-taupe)";
const INPUT_CLASS =
  "h-12 rounded-none border-(--color-stamp-divider) bg-(--color-stamp-white) px-4 text-sm uppercase tracking-[0.05em] text-(--color-stamp-chocolate) placeholder:text-(--color-stamp-taupe)/40 focus-visible:border-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)/20";
const ERROR_CLASS =
  "text-[11px] font-bold uppercase tracking-[0.15em] text-(--color-stamp-error)";

export function CheckoutV2AddressForm({
  fieldPrefix,
  config = shippingFormConfig,
}: CheckoutV2AddressFormPropsI) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutFormData>();

  return (
    <div className="space-y-5">
      {config.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid gap-4 ${
            row.fields.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {row.fields.map((field) => {
            const fieldName = `${fieldPrefix}.${field.id}` as const;
            const error = errors[fieldPrefix]?.[field.id];

            return (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={fieldName} className={LABEL_CLASS}>
                  {field.label}
                  {field.required && (
                    <span className="text-(--color-stamp-gold)" aria-hidden="true">
                      *
                    </span>
                  )}
                </Label>

                {field.id === "country" && field.options ? (
                  <Select
                    onValueChange={(value) => setValue(fieldName, value)}
                    defaultValue=""
                  >
                    <SelectTrigger
                      id={fieldName}
                      className="h-12 rounded-none border-(--color-stamp-divider) bg-(--color-stamp-white) text-sm uppercase tracking-[0.05em] text-(--color-stamp-chocolate) focus:ring-2 focus:ring-(--color-stamp-gold)/30"
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={fieldName}
                    type={field.type || "text"}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${fieldName}-error` : undefined}
                    className={INPUT_CLASS}
                    {...register(fieldName)}
                  />
                )}

                {error && (
                  <p id={`${fieldName}-error`} role="alert" className={ERROR_CLASS}>
                    {error.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
