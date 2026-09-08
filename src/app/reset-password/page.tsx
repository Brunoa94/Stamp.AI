import type { Metadata } from "next";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { PasswordResetConfirmForm } from "@/features/auth/passwordReset/passwordResetConfirm/PasswordResetConfirmForm";
import { PasswordResetConfirmSkeleton } from "@/features/auth/passwordReset/passwordResetConfirm/PasswordResetConfirmSkeleton";
import { PAGE_METADATA_CONFIGS } from "@/features/seo/metadata/pageConfigs";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

export const metadata: Metadata = {
  title: PAGE_METADATA_CONFIGS.resetPassword.title,
  description: PAGE_METADATA_CONFIGS.resetPassword.description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPasswordPage");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Heading as="h1" variant="title" className="text-3xl font-bold text-gray-900">
            {t("title")}
          </Heading>
          <Paragraph variant="sm" className="mt-2 text-gray-600">
            {t("description")}
          </Paragraph>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <Suspense fallback={<PasswordResetConfirmSkeleton />}>
            <PasswordResetConfirmForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
