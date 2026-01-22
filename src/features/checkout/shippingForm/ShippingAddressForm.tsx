"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShippingAddressSchema, ShippingAddressT } from "@/schemas/checkout";
import { Button } from "@/features/ui/button";
import { componentThemes } from "@/theme/components";
import clsx from "clsx";
import { CheckoutErrorDisplay } from "../components";
import { useEffect } from "react";
import { FormField } from "./FormField";
import { shippingFormConfig } from "./shippingFormConfig";

interface Props {
  initialData?: Partial<ShippingAddressT>;
  onSubmit: (data: ShippingAddressT) => void;
  showSubmitButton?: boolean;
  autoSubmitOnChange?: boolean;
}

/**
 * Dynamically generated shipping address form
 * Configuration-driven approach for easy maintenance
 */
const ShippingAddressForm = ({
  initialData,
  onSubmit,
  showSubmitButton = true,
  autoSubmitOnChange = false,
}: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ShippingAddressT>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: initialData || {
      country: "US",
    },
    mode: "onChange",
  });

  const hasErrors = Object.keys(errors).length > 0;
  const formValues = watch();

  // Auto-submit when form is valid and autoSubmitOnChange is enabled
  useEffect(() => {
    if (autoSubmitOnChange && isValid && !isSubmitting) {
      onSubmit(formValues as ShippingAddressT);
    }
  }, [formValues, isValid, autoSubmitOnChange, isSubmitting, onSubmit]);

  return (
    <>
      {hasErrors && (
        <div className="mb-4">
          <CheckoutErrorDisplay error="Please fill in all required fields correctly" />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {shippingFormConfig.map((row, rowIndex) => {
          const isMultiColumn = row.fields.length > 1;

          return (
            <div
              key={rowIndex}
              className={clsx({
                "grid grid-cols-2 gap-4": isMultiColumn,
              })}
            >
              {row.fields.map((field) => (
                <FormField
                  key={field.id}
                  id={field.id}
                  label={field.label}
                  type={field.type}
                  required={field.required}
                  register={register}
                  error={errors[field.id]}
                  options={field.options}
                />
              ))}
            </div>
          );
        })}

        {showSubmitButton && (
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={clsx(componentThemes.button.primary, "w-full")}
            >
              {isSubmitting ? "Saving..." : "Continue to Payment"}
            </Button>
          </div>
        )}
      </form>
    </>
  );
};

export default ShippingAddressForm;
