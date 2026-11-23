import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { AuthPageCard } from "@/features/auth/ui/components/AuthPageCard";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

/**
 * /auth/auth-code-error Route - Authentication Error
 *
 * Error recovery page for failed authentication attempts.
 * SEO: noindex (error/utility page)
 */

export const metadata: Metadata = {
  title: "Authentication Error",
  description:
    "There was an issue with your authentication request. Please try again or request a new link.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthCodeErrorPage() {
  const t = useTranslations("auth.authCodeError");

  return (
    <AuthPageCard>
      <Heading as="h1" variant="card" className="text-(--color-stamp-chocolate)">
        {t("title")}
      </Heading>
      <Paragraph variant="sm" className="mt-3 text-(--color-stamp-taupe)">
        {t("description")}
      </Paragraph>
      <Paragraph variant="xs" className="mt-4 text-(--color-stamp-taupe)">
        {t("expiredNote")}
      </Paragraph>

      <div className="mt-8 flex flex-col gap-3">
        <Button asChild variant="primary">
          <Link href="/">{t("returnHome")}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/auth/reset">{t("requestNewReset")}</Link>
        </Button>
      </div>
    </AuthPageCard>
  );
}
