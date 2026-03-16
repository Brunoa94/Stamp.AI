"use client";

import { DialogContent } from "@/features/ui/dialog";
import { useLoginForm } from "./useLoginForm";
import { LoginDialogHeader } from "./components/LoginDialogHeader";
import { LoginCredentialsFields } from "./components/LoginCredentialsFields";
import { LoginFormActions } from "./components/LoginFormActions";
import { LoginSignupFooter } from "./components/LoginSignupFooter";

export function LoginForm() {
  const { register, handleSubmit, onSubmit, isPending, errors } =
    useLoginForm();

  return (
    <DialogContent
      showCloseButton={false}
      className="max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-135"
    >
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/50 bg-white/85 p-8 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.2)] backdrop-blur-2xl md:p-10">
        <LoginDialogHeader />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
