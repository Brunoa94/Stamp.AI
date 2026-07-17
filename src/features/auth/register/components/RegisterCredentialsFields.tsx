import { FormField } from "@/features/ui/form-field";
import { Mail, Lock, User } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { RegisterI } from "@/schemas/auth";
import { useValidationMessage } from "@/hooks/useValidationMessage";

interface PropsI {
  register: UseFormRegister<RegisterI>;
  errors: FieldErrors<RegisterI>;
}

export function RegisterCredentialsFields({
  register,
  errors,
}: PropsI) {
  const t = useTranslations("auth.register.fields");
  const ve = useValidationMessage();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          id="firstName"
          label={t("firstName")}
          placeholder={t("firstNamePlaceholder")}
          required
          error={ve(errors.firstName?.message)}
          register={register("firstName")}
          variant="stamp-auth"
          leadingIcon={<User className="h-5 w-5" />}
        />

        <FormField
          id="lastName"
          label={t("lastName")}
          placeholder={t("lastNamePlaceholder")}
          required
          error={ve(errors.lastName?.message)}
          register={register("lastName")}
          variant="stamp-auth"
          leadingIcon={<User className="h-5 w-5" />}
        />
      </div>

      <FormField
        id="email"
        label={t("emailLabel")}
        type="email"
        placeholder={t("emailPlaceholder")}
        required
        error={ve(errors.email?.message)}
        register={register("email")}
        variant="stamp-auth"
        leadingIcon={<Mail className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          id="password"
          label={t("passwordLabel")}
          type="password"
          placeholder={t("passwordPlaceholder")}
          required
          error={ve(errors.password?.message)}
          register={register("password")}
          variant="stamp-auth"
          leadingIcon={<Lock className="h-5 w-5" />}
        />

        <FormField
          id="confirmPassword"
          label={t("confirmPassword")}
          type="password"
          placeholder={t("confirmPasswordPlaceholder")}
          required
          error={ve(errors.confirmPassword?.message)}
          register={register("confirmPassword")}
          variant="stamp-auth"
          leadingIcon={<Lock className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}
