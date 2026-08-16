/**
 * CheckoutAddressForm
 *
 * Address form styled in the luxury brutalist system. Composes the shared
 * design-system Input/Select/Label with stamp tokens (chocolate text, cream
 * surfaces, taupe labels, gold focus) rather than the neutral defaults.
 * Reuses the shared shippingFormConfig and the checkout form context so no
 * validation or field logic is duplicated.
 */

import { useTranslations } from "next-intl";
import { useValidationMessage } from "@/hooks/useValidationMessage";
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

interface CheckoutAddressFormPropsI {
  fieldPrefix: "billing" | "shipping";
  config?: FieldRow[];
}

// Consistent with stamp-auth styling from login forms
const LABEL_CLASS =
  "text-sm font-semibold uppercase tracking-wide text-(--color-stamp-chocolate)";
const INPUT_CLASS =
  "h-12 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream) px-5 text-sm uppercase tracking-[0.05em] text-(--color-stamp-chocolate) placeholder:text-(--color-stamp-taupe)/50 focus-visible:border-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)/20";
const ERROR_CLASS =
  "text-xs font-bold uppercase tracking-widest text-(--color-stamp-error)";

export function CheckoutAddressForm({
  fieldPrefix,
  config = shippingFormConfig,
}: CheckoutAddressFormPropsI) {
  const t = useTranslations("checkout.addressForm");
  const ve = useValidationMessage();
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
                  {t(`fields.${field.id}`)}
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
                      className="h-12 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream) px-5 text-sm uppercase tracking-[0.05em] text-(--color-stamp-chocolate) focus:ring-2 focus:ring-(--color-stamp-gold)/20 focus:border-(--color-stamp-gold)"
                    >
                      <SelectValue placeholder={t("selectCountryPlaceholder")} />
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
                    {ve(error.message)}
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
