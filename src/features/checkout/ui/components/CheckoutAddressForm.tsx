/**
 * CheckoutAddressForm
 *
 * Address form built from the design-system Input/Select/Label. The country
 * Select is only sized to match the Input (h-12, rounded-lg, chocolate focus
 * ring). Reuses the shared shippingFormConfig and the checkout form context
 * so no validation or field logic is duplicated.
 */

import { useTranslations } from "next-intl";
import { useValidationMessage } from "@/shared/hooks/useValidationMessage";
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
import {
  shippingFormConfig,
  type FieldRow,
} from "@/shared/constants/shippingFormConfig";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";

interface CheckoutAddressFormPropsI {
  fieldPrefix: "billing" | "shipping";
  config?: FieldRow[];
}

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
                <Label htmlFor={fieldName}>
                  {t(`fields.${field.id}`)}
                  {field.required && (
                    <Span
                      unstyled
                      className="text-(--color-stamp-gold-text)"
                      aria-hidden="true"
                    >
                      *
                    </Span>
                  )}
                </Label>

                {field.id === "country" && field.options ? (
                  <Select
                    onValueChange={(value) => setValue(fieldName, value)}
                    defaultValue=""
                  >
                    <SelectTrigger
                      id={fieldName}
                      className="h-12 rounded-lg px-4 text-base font-normal text-(--color-stamp-chocolate) focus:ring-(--color-stamp-chocolate)"
                    >
                      <SelectValue
                        placeholder={t("selectCountryPlaceholder")}
                      />
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
                    {...register(fieldName)}
                  />
                )}

                {error && (
                  <Paragraph
                    unstyled
                    id={`${fieldName}-error`}
                    role="alert"
                    className="text-sm font-medium text-(--color-stamp-error)"
                  >
                    {ve(error.message)}
                  </Paragraph>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
