"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";
import { useGoogleSignInFallback } from "../../lib/hooks/useGoogleSignInFallback";

/** Sends a guest whose Google account already exists on to Google sign-in. */
export function GoogleSignInRedirect() {
  const t = useTranslations("auth.google");
  useGoogleSignInFallback();

  return (
    <div
      className="flex min-h-screen items-center justify-center gap-3 px-4"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <Paragraph variant="body">{t("redirecting")}</Paragraph>
    </div>
  );
}
