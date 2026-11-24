import type { Metadata } from "next";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { PasswordResetConfirmForm } from "@/features/auth/passwordReset/passwordResetConfirm/PasswordResetConfirmForm";
import { PasswordResetConfirmSkeleton } from "@/features/auth/passwordReset/passwordResetConfirm/PasswordResetConfirmSkeleton";
import { PAGE_METADATA_CONFIGS } from "@/features/seo/metadata/pageConfigs";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { AuthPageCard } from "@/features/auth/ui/components/AuthPageCard";

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
    <AuthPageCard>
      <Heading as="h1" variant="card" className="text-(--color-stamp-chocolate)">
        {t("title")}
      </Heading>
      <Paragraph variant="sm" className="mt-3 text-(--color-stamp-taupe)">
        {t("description")}
      </Paragraph>

      <div className="mt-8 text-left">
        <Suspense fallback={<PasswordResetConfirmSkeleton />}>
          <PasswordResetConfirmForm />
        </Suspense>
      </div>
    </AuthPageCard>
  );
}
