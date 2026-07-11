"use client";

import { usePasswordResetConfirmForm } from "./usePasswordResetConfirmForm";
import { PasswordResetSuccess } from "./PasswordResetSuccess";
import { PasswordResetError } from "./PasswordResetError";
import { FormField } from "@/features/ui/form-field";
import { Button } from "@/features/ui/button";
import { Lock } from "lucide-react";

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
          label="New Password"
          type="password"
          error={errors.password?.message}
          register={register("password")}
          variant="stamp-auth"
          leadingIcon={<Lock className="h-5 w-5" />}
        />

        <FormField
          id="confirmPassword"
          label="Confirm New Password"
          type="password"
          error={errors.confirmPassword?.message}
          register={register("confirmPassword")}
          variant="stamp-auth"
          leadingIcon={<Lock className="h-5 w-5" />}
        />
      </div>

      <Button type="submit" disabled={isPending} variant="stamp-auth-primary" className="w-full">
        {isPending ? "Resetting Password..." : "Reset Password"}
      </Button>
    </form>
  );
}
