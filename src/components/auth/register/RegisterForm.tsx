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
import { useRegisterForm } from "./useRegisterForm";
import { RegistrationSuccessMessage } from "./RegistrationSuccessMessage";

export function RegisterForm() {
  const { register, handleSubmit, onSubmit, isPending, errors, isSuccess } = useRegisterForm();

  if (isSuccess) {
    return <RegistrationSuccessMessage />;
  }

  return (
    <DialogContent className="max-w-96">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-center">Create Account</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.InputText
              name="firstName"
              title="First Name"
              register={register}
            />
            <Form.InputText
              name="lastName"
              title="Last Name"
              register={register}
            />
          </div>

          <Form.InputText
            name="email"
            title="Email"
            register={register}
          />

          <Form.InputPassword
            name="password"
            title="Password"
            register={register}
          />

          <Form.InputPassword
            name="confirmPassword"
            title="Confirm Password"
            register={register}
          />
        </div>

        {errors.root && (
          <p className="text-sm text-red-500">{errors.root.message}</p>
        )}

        <DialogFooter className="flex flex-col gap-2">
          <Button
            aria-label="Create Account"
            variant="default"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Creating Account..." : "Create Account"}
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