"use client";

import { useFormContext } from "react-hook-form";
import { FormField } from "@/features/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/features/ui/select";
import { Label } from "@/features/ui/label";
import { shippingFormConfig, type FieldRow } from "@/constants/shippingFormConfig";
import type { CheckoutFormData } from "../../lib/context/CheckoutFormContext";

interface AddressFormProps {
  fieldPrefix: "billing" | "shipping";
  config?: FieldRow[];
}

/**
 * AddressForm - Generic address form component
 * Eliminates duplication between BillingAddressSection and ShippingAddressSection
 *
 * Uses existing FormField component from global UI with shipping variant
 * Handles both regular input fields and country select dropdown
 */
export function AddressForm({
  fieldPrefix,
  config = shippingFormConfig
}: AddressFormProps) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutFormData>();

  return (
    <div className="space-y-4">
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

            // Country field with select dropdown
            if (field.id === "country" && field.options) {
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={fieldName}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Select
                    onValueChange={(value) => setValue(fieldName, value)}
                    defaultValue=""
                  >
                    <SelectTrigger id={fieldName}>
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
                  {error && (
                    <p className="text-sm text-destructive">{error.message}</p>
                  )}
                </div>
              );
            }

            // Regular input fields using FormField component
            return (
              <FormField
                key={field.id}
                id={fieldName}
                label={field.label}
                type={field.type || "text"}
                required={field.required}
                error={error?.message}
                register={register(fieldName)}
                variant="shipping"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
