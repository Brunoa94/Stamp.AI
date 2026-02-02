import type { UseFormReturn } from "react-hook-form";
import type { ShippingAddressT } from "@/schemas/checkout";
import { FormField } from "@/features/ui/form-field";

interface AddressFormFieldsProps {
  form: UseFormReturn<ShippingAddressT>;
}

export function AddressFormFields({ form }: AddressFormFieldsProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="first_name"
          label="First Name"
          required
          error={errors.first_name?.message}
          register={register("first_name")}
        />
        <FormField
          id="last_name"
          label="Last Name"
          error={errors.last_name?.message}
          register={register("last_name")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          required
          error={errors.email?.message}
          register={register("email")}
        />
        <FormField
          id="phone"
          label="Phone"
          type="tel"
          error={errors.phone?.message}
          register={register("phone")}
        />
      </div>

      <FormField
        id="address1"
        label="Address Line 1"
        placeholder="Street address"
        required
        error={errors.address1?.message}
        register={register("address1")}
      />

      <FormField
        id="address2"
        label="Address Line 2 (Optional)"
        placeholder="Apartment, suite, unit, etc."
        register={register("address2")}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          id="city"
          label="City"
          required
          error={errors.city?.message}
          register={register("city")}
        />
        <FormField
          id="region"
          label="State/Region"
          error={errors.region?.message}
          register={register("region")}
        />
        <FormField
          id="zip"
          label="ZIP/Postal Code"
          error={errors.zip?.message}
          register={register("zip")}
        />
      </div>

      <FormField
        id="country"
        label="Country"
        required
        error={errors.country?.message}
        register={register("country")}
      />
    </div>
  );
}
