"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { AuthPageCard } from "./AuthPageCard";
import { useGoogleSignInFallback } from "../../lib/hooks/useGoogleSignInFallback";

/** Sends a guest whose Google account already exists on to Google sign-in. */
export function GoogleSignInRedirect() {
  const t = useTranslations("auth.google");
  const { isError, retry } = useGoogleSignInFallback();

  return (
    <AuthPageCard>
      <Heading as="h1" variant="card" className="text-(--color-stamp-chocolate)">
        {t("meta.title")}
      </Heading>
      {isError ? (
        <div role="alert" className="mt-6 flex flex-col items-center gap-6">
          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            {t("failed")}
          </Paragraph>
          <div className="flex flex-wrap justify-center gap-3">
            <Button type="button" variant="primary" onClick={retry}>
              {t("retry")}
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">{t("backHome")}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-center gap-3" role="status" aria-live="polite">
          <Loader2 className="size-5 animate-spin text-(--color-stamp-gold-text)" aria-hidden />
          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            {t("redirecting")}
          </Paragraph>
        </div>
      )}
    </AuthPageCard>
  );
}
