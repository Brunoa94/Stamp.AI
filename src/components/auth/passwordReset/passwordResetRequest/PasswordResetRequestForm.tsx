"use client";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/global/input/form";
import { usePasswordResetRequestForm } from "./usePasswordResetRequestForm";
import { PasswordResetRequestSuccess } from "./PasswordResetRequestSuccess";

export function PasswordResetRequestForm() {
  const { register, handleSubmit, onSubmit, isPending, errors, isSuccess } = usePasswordResetRequestForm();

  if (isSuccess) {
    return <PasswordResetRequestSuccess />;
  }

  return (
    <DialogContent className="max-w-96">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-center">Reset Password</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <Form.InputText
            name="email"
            title="Email"
            register={register}
          />
        </div>

        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}

        <DialogFooter className="flex flex-col gap-2">
          <Button
            aria-label="Send Reset Email"
            variant="default"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Sending..." : "Send Reset Email"}
          </Button>
          <DialogClose asChild>
            <Button aria-label="Cancel" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}