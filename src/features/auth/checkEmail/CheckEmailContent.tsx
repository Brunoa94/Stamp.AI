"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCaptcha } from "@/shared/hooks/useCaptcha";
import { CAPTCHA_ACTIONS } from "@/lib/security/captcha/constants";
import { AuthService } from "@/shared/services/authService";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;

  const maskedLocal =
    local.length <= 2
      ? local
      : `${local[0]}${"•".repeat(Math.min(local.length - 2, 5))}${local[local.length - 1]}`;

  return `${maskedLocal}@${domain}`;
}

export function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const t = useTranslations("auth.checkEmail");
  const { handleError, handleSuccess } = useErrorHandler();
  const { getToken: getCaptchaToken, isReady: isCaptchaReady } = useCaptcha({
    action: CAPTCHA_ACTIONS.REGISTER,
  });

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResend = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    try {
      const captchaToken = await getCaptchaToken();
      await AuthService.resendEmailVerification(email, captchaToken);
      setResendSuccess(true);
      handleSuccess(t("resendSuccess"));
    } catch (error) {
      handleError(error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-stamp-cream) px-4">
      <div className="w-full max-w-md border-2 border-(--color-stamp-divider) bg-(--color-stamp-off-white) p-10 shadow-(--shadow-stamp-modal)">
        <div className="text-center space-y-6">
          <div className="text-(--color-stamp-gold) mb-4">
            <Mail className="w-16 h-16 mx-auto" strokeWidth={1.5} />
          </div>

          <Heading
            as="h1"
            variant="card"
            className="text-2xl tracking-tight text-(--color-stamp-chocolate)"
          >
            {t("title")}
          </Heading>

          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            {t("description")}
          </Paragraph>

          {email && (
            <Paragraph
              variant="sm"
              className="font-medium text-(--color-stamp-chocolate)"
            >
              {maskEmail(email)}
            </Paragraph>
          )}

          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            {t("instructions")}
          </Paragraph>

          <div className="space-y-4 pt-4">
            {!resendSuccess ? (
              <Button
                variant="secondary"
                onClick={handleResend}
                disabled={isResending || !isCaptchaReady || !email}
                className="w-full"
              >
                {isResending ? t("resending") : t("resendButton")}
              </Button>
            ) : (
              <Paragraph
                variant="sm"
                className="text-(--color-stamp-success) font-medium"
              >
                {t("resendSuccess")}
              </Paragraph>
            )}

            <Button asChild variant="primary" className="w-full">
              <Link href="/">{t("backToLogin")}</Link>
            </Button>
          </div>

          <Paragraph variant="sm" className="text-(--color-stamp-taupe) pt-4">
            {t("spamNote")}
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
