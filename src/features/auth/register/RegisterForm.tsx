"use client";

import { useRegisterForm } from "./useRegisterForm";
import { useTranslations } from "next-intl";
import { RegisterDialogHeader } from "./components/RegisterDialogHeader";
import { RegisterCredentialsFields } from "./components/RegisterCredentialsFields";
import { RegisterFormActions } from "./components/RegisterFormActions";
import { RegisterLoginFooter } from "./components/RegisterLoginFooter";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { AuthDialogFrame } from "../components/AuthDialogFrame";
import { AuthBrandPanel } from "../components/AuthBrandPanel";
import { AuthEmailDivider } from "../components/AuthEmailDivider";
import { Paragraph } from "@/features/ui/paragraph";

interface PropsI {
  /** Swaps the open dialog to the Login form. */
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: PropsI) {
  const {
    register,
    handleSubmit,
    onSubmit,
    isPending,
    isCaptchaReady,
    errors,
  } = useRegisterForm();
  const t = useTranslations("auth.register.form");

  return (
    <AuthDialogFrame
      srTitle={t("srTitle")}
      closeAria={t("closeAria")}
      panel={<AuthBrandPanel namespace="auth.register.panel" />}
    >
      <RegisterDialogHeader />

      <GoogleSignInButton />

      <AuthEmailDivider label={t("orContinueWithEmail")} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <RegisterCredentialsFields register={register} errors={errors} />

        {errors.root?.message && (
          <Paragraph
            variant="xs"
            role="alert"
            className="font-bold uppercase tracking-widest text-(--color-stamp-error)"
          >
            {errors.root.message}
          </Paragraph>
        )}

        <RegisterFormActions
          isPending={isPending}
          isCaptchaReady={isCaptchaReady}
        />
      </form>

      <RegisterLoginFooter onSwitchToLogin={onSwitchToLogin} />
    </AuthDialogFrame>
  );
}
