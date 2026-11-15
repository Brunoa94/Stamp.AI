"use client";

import { Paragraph } from "@/features/ui/paragraph";
import { useTranslations } from "next-intl";
import { useLoginForm } from "./useLoginForm";
import { LoginDialogHeader } from "./components/LoginDialogHeader";
import { LoginCredentialsFields } from "./components/LoginCredentialsFields";
import { LoginFormActions } from "./components/LoginFormActions";
import { LoginSignupFooter } from "./components/LoginSignupFooter";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { AuthDialogFrame } from "../components/AuthDialogFrame";
import { AuthBrandPanel } from "../components/AuthBrandPanel";
import { AuthEmailDivider } from "../components/AuthEmailDivider";

export function LoginForm() {
  const { register, handleSubmit, onSubmit, isPending, isCaptchaReady, errors } =
    useLoginForm();
  const t = useTranslations("auth.login.form");

  return (
    <AuthDialogFrame
      srTitle={t("srTitle")}
      closeAria={t("closeAria")}
      panel={<AuthBrandPanel namespace="auth.login.panel" />}
    >
      <LoginDialogHeader />

      <GoogleSignInButton />

      <AuthEmailDivider label={t("orContinueWithEmail")} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <LoginCredentialsFields register={register} errors={errors} />

        {errors.root?.message && (
          <Paragraph
            variant="xs"
            role="alert"
            className="font-bold uppercase tracking-widest text-(--color-stamp-error)"
          >
            {errors.root.message}
          </Paragraph>
        )}

        <LoginFormActions isPending={isPending} isCaptchaReady={isCaptchaReady} />
      </form>

      <LoginSignupFooter />
    </AuthDialogFrame>
  );
}
