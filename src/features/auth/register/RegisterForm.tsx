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
      <div className="relative overflow-hidden rounded-3xl border border-violet-200/45 bg-linear-to-br from-white/80 via-violet-50/70 to-cyan-50/65 p-8 shadow-[0_36px_90px_-24px_rgba(124,58,237,0.28)] backdrop-blur-2xl md:p-10 dark:border-violet-300/20 dark:from-slate-900/85 dark:via-violet-950/35 dark:to-cyan-950/25">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-br from-white/35 via-transparent to-violet-200/20" />

        <RegisterDialogHeader />

        <div className="mb-6 relative z-10">
          <GoogleSignInButton className="border-violet-200/70 bg-white/70 hover:bg-white/85 dark:border-violet-300/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15" />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-violet-200/70 dark:border-violet-300/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.12em]">
              <span className="px-3 text-violet-500/80 dark:text-violet-300/80">
                or continue with email
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 relative z-10"
        >
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
