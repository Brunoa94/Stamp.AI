"use client";

import { usePasswordResetConfirmForm } from "./usePasswordResetConfirmForm";
import { PasswordResetSuccess } from "./PasswordResetSuccess";
import { PasswordResetError } from "./PasswordResetError";
import { FormField } from "@/features/ui/form-field";
import { Button } from "@/features/ui/button";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useValidationMessage } from "@/hooks/useValidationMessage";

export function PasswordResetConfirmForm() {
  const {
    register,
    handleSubmit,
    onSubmit,
    isPending,
    isSuccess,
    isError,
    errors,
  } = usePasswordResetConfirmForm();
  const t = useTranslations("auth.passwordReset.confirm");
  const ve = useValidationMessage();

  if (isSuccess) {
    return <PasswordResetSuccess />;
  }

  if (isError) {
    return <PasswordResetError />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        <FormField
          id="password"
          label={t("newPassword")}
          type="password"
          error={ve(errors.password?.message)}
          register={register("password")}
          variant="stamp-auth"
          leadingIcon={<Lock className="h-5 w-5" />}
        />

        <FormField
          id="confirmPassword"
          label={t("confirmNewPassword")}
          type="password"
          error={ve(errors.confirmPassword?.message)}
          register={register("confirmPassword")}
          variant="stamp-auth"
          leadingIcon={<Lock className="h-5 w-5" />}
        />
      </div>

      <Button type="submit" disabled={isPending} variant="stamp-auth-primary" className="w-full">
        {isPending ? t("resetting") : t("resetPassword")}
      </Button>
    </form>
  );
}
