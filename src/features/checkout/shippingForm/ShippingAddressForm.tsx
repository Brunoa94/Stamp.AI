"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShippingAddressSchema, ShippingAddressT } from "@/schemas/checkout";
import { Button } from "@/features/ui/button";
import clsx from "clsx";
import { CheckoutErrorDisplay } from "../components";
import { useEffect } from "react";
import { FormField } from "@/features/ui/form-field";
import { SelectFormField } from "@/features/ui/select-form-field";
import { shippingFormConfig } from "@/constants/shippingFormConfig";

interface Props {
  initialData?: Partial<ShippingAddressT>;
  onSubmit: (data: ShippingAddressT) => void;
  showSubmitButton?: boolean;
  autoSubmitOnChange?: boolean;
  submitLabel?: string;
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
  submitLabel,
}: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
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

  // Keep form fields in sync when initial data arrives asynchronously (e.g. retry flow)
  useEffect(() => {
    if (initialData) {
      reset({
        country: "US",
        ...initialData,
      });
    }
  }, [initialData, reset]);

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {shippingFormConfig.map((row, rowIndex) => {
          const isMultiColumn = row.fields.length > 1;

          return (
            <div
              key={rowIndex}
              className={clsx({
                "grid grid-cols-1 md:grid-cols-2 gap-6": isMultiColumn,
              })}
            >
              {row.fields.map((field) =>
                field.options ? (
                  <SelectFormField<ShippingAddressT>
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    required={field.required}
                    control={control}
                    error={errors[field.id]?.message}
                    options={field.options}
                    variant="shipping"
                  />
                ) : (
                  <FormField
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    type={field.type}
                    required={field.required}
                    register={register(field.id)}
                    error={errors[field.id]?.message}
                    variant="shipping"
                  />
                ),
              )}
            </div>
          );
        })}

        {showSubmitButton && (
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-none bg-linear-to-br from-[#7C3AED] to-[#06B6D4] text-white font-heading font-bold uppercase tracking-widest"
            >
              {isSubmitting
                ? "Saving..."
                : (submitLabel ?? "Continue to Payment")}
            </Button>
          </div>
        )}
      </form>
    </>
  );
};

export default ShippingAddressForm;
