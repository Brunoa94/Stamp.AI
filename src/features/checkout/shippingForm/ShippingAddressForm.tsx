"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShippingAddressSchema, ShippingAddressT } from "@/schemas/checkout";
import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { componentThemes } from "@/theme/components";
import clsx from "clsx";
import { CheckoutErrorDisplay } from "../components";
import { useEffect } from "react";

interface Props {
  initialData?: Partial<ShippingAddressT>;
  onSubmit: (data: ShippingAddressT) => void;
  showSubmitButton?: boolean;
  autoSubmitOnChange?: boolean;
}

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
    mode: "onChange", // Validate on change for auto-submit
  });

  const hasErrors = Object.keys(errors).length > 0;

  // Watch all form values for auto-submit
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="first_name"
              className={componentThemes.text.label}
            >
              First Name <span className="text-red-600" aria-label="required">*</span>
            </label>
            <Input
              id="first_name"
              type="text"
              {...register("first_name")}
              aria-invalid={!!errors.first_name}
              aria-describedby={errors.first_name ? "first_name-error" : undefined}
              className={clsx(componentThemes.input.base, {
                [componentThemes.input.error]: errors.first_name,
              })}
            />
            {errors.first_name && (
              <p id="first_name-error" role="alert" className="text-red-600 text-sm mt-1">
                {errors.first_name.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="last_name"
              className={componentThemes.text.label}
            >
              Last Name
            </label>
            <Input
              id="last_name"
              type="text"
              {...register("last_name")}
              aria-invalid={!!errors.last_name}
              className={componentThemes.input.base}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className={componentThemes.text.label}
          >
            Email <span className="text-red-600" aria-label="required">*</span>
          </label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={clsx(componentThemes.input.base, {
              [componentThemes.input.error]: errors.email,
            })}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-red-600 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className={componentThemes.text.label}
          >
            Phone
          </label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            className={componentThemes.input.base}
          />
        </div>

        <div>
          <label
            htmlFor="address1"
            className={componentThemes.text.label}
          >
            Address Line 1 <span className="text-red-600" aria-label="required">*</span>
          </label>
          <Input
            id="address1"
            type="text"
            {...register("address1")}
            aria-invalid={!!errors.address1}
            aria-describedby={errors.address1 ? "address1-error" : undefined}
            className={clsx(componentThemes.input.base, {
              [componentThemes.input.error]: errors.address1,
            })}
          />
          {errors.address1 && (
            <p id="address1-error" role="alert" className="text-red-600 text-sm mt-1">
              {errors.address1.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="address2"
            className={componentThemes.text.label}
          >
            Address Line 2
          </label>
          <Input
            id="address2"
            type="text"
            {...register("address2")}
            className={componentThemes.input.base}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="city"
              className={componentThemes.text.label}
            >
              City <span className="text-red-600" aria-label="required">*</span>
            </label>
            <Input
              id="city"
              type="text"
              {...register("city")}
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? "city-error" : undefined}
              className={clsx(componentThemes.input.base, {
                [componentThemes.input.error]: errors.city,
              })}
            />
            {errors.city && (
              <p id="city-error" role="alert" className="text-red-600 text-sm mt-1">
                {errors.city.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="region"
              className={componentThemes.text.label}
            >
              State/Region
            </label>
            <Input
              id="region"
              type="text"
              {...register("region")}
              className={componentThemes.input.base}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="zip"
              className={componentThemes.text.label}
            >
              ZIP/Postal Code
            </label>
            <Input
              id="zip"
              type="text"
              {...register("zip")}
              className={componentThemes.input.base}
            />
          </div>
          <div>
            <label
              htmlFor="country"
              className={componentThemes.text.label}
            >
              Country
            </label>
            <select
              id="country"
              {...register("country")}
              className={componentThemes.input.base}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
            </select>
          </div>
        </div>

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
