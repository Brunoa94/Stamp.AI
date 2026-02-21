"use client";

import { usePasswordResetConfirmForm } from "./usePasswordResetConfirmForm";
import { PasswordResetSuccess } from "./PasswordResetSuccess";
import { PasswordResetError } from "./PasswordResetError";
import { FormField } from "@/features/ui/form-field";
import { Button } from "@/features/ui/button";

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
      <div className="space-y-4">
        <FormField
          id="password"
          label="New Password"
          type="password"
          error={errors.password?.message}
          register={register("password")}
        />

        <FormField
          id="confirmPassword"
          label="Confirm New Password"
          type="password"
          error={errors.confirmPassword?.message}
          register={register("confirmPassword")}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Resetting Password..." : "Reset Password"}
      </Button>
    </form>
  );
}
