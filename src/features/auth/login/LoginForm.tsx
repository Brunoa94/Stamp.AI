"use client";

import { DialogContent, DialogTitle } from "@/features/ui/dialog";
import { useLoginForm } from "./useLoginForm";
import { LoginDialogHeader } from "./components/LoginDialogHeader";
import { LoginCredentialsFields } from "./components/LoginCredentialsFields";
import { LoginFormActions } from "./components/LoginFormActions";
import { LoginSignupFooter } from "./components/LoginSignupFooter";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

export function LoginForm() {
  const { register, handleSubmit, onSubmit, isPending, errors } =
    useLoginForm();

  return (
    <DialogContent
      showCloseButton={false}
      className="max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-135"
    >
      <DialogTitle className="sr-only">Login</DialogTitle>
      <div className="relative overflow-hidden rounded-[2.25rem] border border-violet-200/45 bg-linear-to-br from-white/80 via-violet-50/70 to-cyan-50/65 p-8 shadow-[0_36px_90px_-24px_rgba(124,58,237,0.28)] backdrop-blur-2xl md:p-10 dark:border-violet-300/20 dark:from-slate-900/85 dark:via-violet-950/35 dark:to-cyan-950/25">
        <div className="pointer-events-none absolute inset-0 rounded-[2.25rem] bg-linear-to-br from-white/35 via-transparent to-violet-200/20" />

        <LoginDialogHeader />

        <div className="mb-6 relative z-10">
          <GoogleSignInButton className="border-violet-200/70 bg-white/70 hover:bg-white/85 dark:border-violet-300/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15" />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-violet-200/70 dark:border-violet-300/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.12em]">
              <span className="px-3 text-violet-500/80 dark:text-violet-300/80 bg-transparent">
                or continue with email
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 relative z-10"
        >
          <LoginCredentialsFields register={register} errors={errors} />

          {errors.root?.message && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {errors.root.message}
            </p>
          )}

          <LoginFormActions isPending={isPending} />
        </form>

        <LoginSignupFooter />
      </div>
    </DialogContent>
  );
}
