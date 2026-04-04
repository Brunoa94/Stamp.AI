"use client";

import { useRegisterForm } from "./useRegisterForm";
import { RegistrationSuccessMessage } from "./RegistrationSuccessMessage";
import { DialogContent, DialogTitle } from "@/features/ui/dialog";
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
      className="max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-xl"
    >
      <DialogTitle className="sr-only">Create Account</DialogTitle>
      <div className="relative overflow-hidden rounded-3xl border border-white bg-white/92 p-8 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)] backdrop-blur-2xl md:p-10">
        <RegisterDialogHeader />

        <div className="mb-6">
          <GoogleSignInButton />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className=" px-3 text-slate-500">
                or continue with email
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
