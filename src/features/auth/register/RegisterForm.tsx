"use client";

import { useRegisterForm } from "./useRegisterForm";
import { RegistrationSuccessMessage } from "./RegistrationSuccessMessage";
import { DialogContent, DialogTitle, DialogClose } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { RegisterDialogHeader } from "./components/RegisterDialogHeader";
import { RegisterCredentialsFields } from "./components/RegisterCredentialsFields";
import { RegisterFormActions } from "./components/RegisterFormActions";
import { RegisterLoginFooter } from "./components/RegisterLoginFooter";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

export function RegisterForm() {
  const { register, handleSubmit, onSubmit, isPending, errors, isSuccess } =
    useRegisterForm();
  const t = useTranslations("auth.register.form");

  if (isSuccess) {
    return <RegistrationSuccessMessage />;
  }

  return (
    <DialogContent
      showCloseButton={false}
      className="max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-137.5"
    >
      <DialogTitle className="sr-only">{t("srTitle")}</DialogTitle>
      <div className="relative overflow-hidden border-2 border-(--color-stamp-divider) bg-(--color-stamp-off-white) px-10 pt-12 pb-10 shadow-(--shadow-stamp-modal)">
        {/* Close button */}
        <DialogClose asChild>
          <Button
            type="button"
            variant="stamp-close"
            size="icon"
            aria-label={t("closeAria")}
            className="absolute top-8 right-8 z-20"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogClose>

        <RegisterDialogHeader />

        <GoogleSignInButton />

        <div className="relative flex items-center my-10">
          <div className="grow border-t border-(--color-stamp-divider)" />
          <span className="shrink mx-4 text-lg font-bold text-(--color-stamp-gold) uppercase tracking-[0.2em]">
            {t("orContinueWithEmail")}
          </span>
          <div className="grow border-t border-(--color-stamp-divider)" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <RegisterCredentialsFields register={register} errors={errors} />

          {errors.root?.message && (
            <p
              role="alert"
              className="text-lg font-bold uppercase tracking-widest text-(--color-stamp-error)"
            >
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
