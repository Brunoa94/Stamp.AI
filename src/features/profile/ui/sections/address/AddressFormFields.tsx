import type { UseFormReturn } from "react-hook-form";
import type { ShippingAddressT } from "@/schemas/checkout";
import { FormField } from "@/features/ui/form-field";
import { useTranslations } from "next-intl";

interface AddressFormFieldsProps {
  form: UseFormReturn<ShippingAddressT>;
}

export function AddressFormFields({ form }: AddressFormFieldsProps) {
  const t = useTranslations("profile.addressForm");
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
          label={t("firstName")}
          type="text"
          required
          register={register("first_name")}
          error={errors.first_name?.message}
          variant="profile"
        />
        <FormField
          id="last_name"
          label={t("lastName")}
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
          label={t("email")}
          type="email"
          required
          register={register("email")}
          error={errors.email?.message}
          variant="profile"
        />
        <FormField
          id="phone"
          label={t("phone")}
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
        label={t("address1")}
        type="text"
        placeholder={t("address1Placeholder")}
        required
        register={register("address1")}
        error={errors.address1?.message}
        variant="profile"
      />

      {/* Address Line 2 */}
      <FormField
        id="address2"
        label={t("address2")}
        type="text"
        placeholder={t("address2Placeholder")}
        register={register("address2")}
        error={errors.address2?.message}
        variant="profile"
      />

      {/* City, State, ZIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FormField
          id="city"
          label={t("city")}
          type="text"
          required
          register={register("city")}
          error={errors.city?.message}
          variant="profile"
        />
        <FormField
          id="region"
          label={t("region")}
          type="text"
          required
          register={register("region")}
          error={errors.region?.message}
          variant="profile"
        />
        <FormField
          id="zip"
          label={t("zip")}
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
        label={t("country")}
        type="text"
        required
        register={register("country")}
        error={errors.country?.message}
        variant="profile"
      />
    </div>
  );
}
