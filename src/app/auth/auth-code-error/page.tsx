import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Heading as="h1" variant="title" className="text-gray-900">
            {t("title")}
          </Heading>
          <Paragraph variant="sm" className="mt-2 text-gray-600">
            {t("description")}
          </Paragraph>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center space-y-4">
            <Paragraph variant="default" className="text-gray-600">
              {t("expiredNote")}
            </Paragraph>

            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/">
                  {t("returnHome")}
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/auth/reset">
                  {t("requestNewReset")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}