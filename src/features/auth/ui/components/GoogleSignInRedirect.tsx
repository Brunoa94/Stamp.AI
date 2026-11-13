"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { useGoogleSignInFallback } from "../../lib/hooks/useGoogleSignInFallback";

/** Sends a guest whose Google account already exists on to Google sign-in. */
export function GoogleSignInRedirect() {
  const t = useTranslations("auth.google");
  const { isError, retry } = useGoogleSignInFallback();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Heading as="h1" variant="cardCompact">
        {t("meta.title")}
      </Heading>
      {isError ? (
        <div role="alert" className="flex flex-col items-center gap-4">
          <Paragraph variant="body">{t("failed")}</Paragraph>
          <div className="flex gap-3">
            <Button type="button" onClick={retry}>
              {t("retry")}
            </Button>
            <Button asChild variant="outline">
              <Link href="/">{t("backHome")}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <Paragraph variant="body">{t("redirecting")}</Paragraph>
        </div>
      )}
    </div>
  );
}
