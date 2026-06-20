"use client";

import { useRegisterForm } from "./useRegisterForm";
import { RegistrationSuccessMessage } from "./RegistrationSuccessMessage";
import { DialogContent, DialogTitle, DialogClose } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";
import { X } from "lucide-react";
import { RegisterDialogHeader } from "./components/RegisterDialogHeader";
import { RegisterCredentialsFields } from "./components/RegisterCredentialsFields";
import { RegisterFormActions } from "./components/RegisterFormActions";
import { RegisterLoginFooter } from "./components/RegisterLoginFooter";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

export function RegisterForm() {
  const { register, handleSubmit, onSubmit, isPending, errors, isSuccess } =
    useRegisterForm();

  if (isSuccess) {
    return <RegistrationSuccessMessage />;
  }

  return (
    <DialogContent
      showCloseButton={false}
      className="max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-[550px]"
    >
      <DialogTitle className="sr-only">Create Account</DialogTitle>
      <div className="relative overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-2xl px-10 pt-12 pb-10">
        {/* Close button */}
        <DialogClose asChild>
          <Button
            type="button"
            variant="auth-close"
            size="icon"
            aria-label="Close register modal"
            className="absolute top-8 right-8 z-20"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogClose>

        <RegisterDialogHeader />

        <GoogleSignInButton />

        <div className="relative flex items-center my-10">
          <div className="grow border-t border-ink/5" />
          <span className="shrink mx-4 text-[10px] font-bold text-purple-500 uppercase tracking-[0.3em]">
            or continue with email
          </span>
          <div className="grow border-t border-ink/5" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <RegisterCredentialsFields register={register} errors={errors} />

          {errors.root?.message && (
            <p role="alert" className="text-sm text-red-600">
              {errors.root.message}
            </p>
          )}

          <RegisterFormActions isPending={isPending} />
        </form>

        <RegisterLoginFooter />
      </div>
    </DialogContent>
  );
}
