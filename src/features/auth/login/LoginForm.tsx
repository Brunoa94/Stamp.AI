"use client";

import { DialogContent, DialogTitle, DialogClose } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";
import { X } from "lucide-react";
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
      className="max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-[550px]"
    >
      <DialogTitle className="sr-only">Login</DialogTitle>
      <div className="relative overflow-hidden border-2 border-(--color-stamp-divider) bg-(--color-stamp-off-white) px-10 pt-12 pb-10 shadow-(--shadow-stamp-modal)">
        {/* Close button */}
        <DialogClose asChild>
          <Button
            type="button"
            variant="stamp-auth-close"
            size="icon"
            aria-label="Close login modal"
            className="absolute top-8 right-8 z-20"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogClose>

        <LoginDialogHeader />

        <GoogleSignInButton />

        <div className="relative flex items-center my-10">
          <div className="grow border-t border-(--color-stamp-divider)" />
          <span className="shrink mx-4 text-lg font-bold text-(--color-stamp-gold) uppercase tracking-[0.2em]">
            or continue with email
          </span>
          <div className="grow border-t border-(--color-stamp-divider)" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <LoginCredentialsFields register={register} errors={errors} />

          {errors.root?.message && (
            <p role="alert" className="text-lg font-bold uppercase tracking-widest text-(--color-stamp-error)">
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
