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
    <div className="space-y-8">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField
          id="first_name"
          label="First Name"
          type="text"
          required
          register={register("first_name")}
          error={errors.first_name?.message}
          variant="profile"
        />
        <FormField
          id="last_name"
          label="Last Name"
          type="text"
          required
          register={register("last_name")}
          error={errors.last_name?.message}
          variant="profile"
        />
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField
          id="email"
          label="Email"
          type="email"
          required
          register={register("email")}
          error={errors.email?.message}
          variant="profile"
        />
        <FormField
          id="phone"
          label="Phone"
          type="tel"
          required
          register={register("phone")}
          error={errors.phone?.message}
          variant="profile"
        />
      </div>

      {/* Address Line 1 */}
      <FormField
        id="address1"
        label="Address Line 1"
        type="text"
        placeholder="Street address"
        required
        register={register("address1")}
        error={errors.address1?.message}
        variant="profile"
      />

      {/* Address Line 2 */}
      <FormField
        id="address2"
        label="Address Line 2 (Optional)"
        type="text"
        placeholder="Apartment, suite, unit, etc."
        register={register("address2")}
        error={errors.address2?.message}
        variant="profile"
      />

      {/* City, State, ZIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FormField
          id="city"
          label="City"
          type="text"
          required
          register={register("city")}
          error={errors.city?.message}
          variant="profile"
        />
        <FormField
          id="region"
          label="State/Region"
          type="text"
          required
          register={register("region")}
          error={errors.region?.message}
          variant="profile"
        />
        <FormField
          id="zip"
          label="ZIP/Postal Code"
          type="text"
          required
          register={register("zip")}
          error={errors.zip?.message}
          variant="profile"
        />
      </div>

      {/* Country */}
      <FormField
        id="country"
        label="Country"
        type="text"
        required
        register={register("country")}
        error={errors.country?.message}
        variant="profile"
      />
    </div>
  );
}
