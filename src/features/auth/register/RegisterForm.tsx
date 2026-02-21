"use client";

import { useRegisterForm } from "./useRegisterForm";
import { RegistrationSuccessMessage } from "./RegistrationSuccessMessage";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/ui/dialog";

import { Button } from "@/features/ui/button";
import { FormField } from "@/features/ui/form-field";

export function RegisterForm() {
  const { register, handleSubmit, onSubmit, isPending, errors, isSuccess } =
    useRegisterForm();

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
            <FormField
              id="firstName"
              label="First Name"
              type="text"
              error={errors.firstName?.message}
              register={register("firstName")}
            />
            <FormField
              id="lastName"
              label="Last Name"
              type="text"
              error={errors.lastName?.message}
              register={register("lastName")}
            />
          </div>

          <FormField
            id="email"
            label="Email"
            type="email"
            error={errors.email?.message}
            register={register("email")}
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            error={errors.password?.message}
            register={register("password")}
          />

          <FormField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            error={errors.confirmPassword?.message}
            register={register("confirmPassword")}
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
