"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/global/input/form";
import { usePasswordResetConfirmForm } from "./usePasswordResetConfirmForm";
import { PasswordResetSuccess } from "./PasswordResetSuccess";
import { PasswordResetError } from "./PasswordResetError";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PasswordResetConfirmForm() {
  const router = useRouter();
  const { register, handleSubmit, onSubmit, isPending, isSuccess, isError } =
    usePasswordResetConfirmForm();

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [isSuccess, router]);

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
