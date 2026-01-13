"use client";

import { usePasswordResetConfirmForm } from "./usePasswordResetConfirmForm";
import { PasswordResetSuccess } from "./PasswordResetSuccess";
import { PasswordResetError } from "./PasswordResetError";
import { Form } from "@/features/global/input/form";
import { Button } from "@/features/ui/button";

export function PasswordResetConfirmForm() {
  const { register, handleSubmit, onSubmit, isPending, isSuccess, isError } =
    usePasswordResetConfirmForm();

  if (isSuccess) {
    return <PasswordResetSuccess />;
  }

  if (isError) {
    return <PasswordResetError />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Form.InputPassword
          name="password"
          title="New Password"
          register={register}
        />

        <Form.InputPassword
          name="confirmPassword"
          title="Confirm New Password"
          register={register}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Resetting Password..." : "Reset Password"}
      </Button>
    </form>
  );
}
