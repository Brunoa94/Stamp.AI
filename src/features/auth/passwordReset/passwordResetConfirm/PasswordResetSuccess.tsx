import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function PasswordResetSuccess() {
  const t = useTranslations("auth.passwordReset.success");

  return (
    <div className="text-center space-y-6">
      <div className="text-(--color-stamp-success) mb-4">
        <CheckCircle className="w-16 h-16 mx-auto" strokeWidth={1.5} />
      </div>
      <Heading
        as="h3"
        variant="card"
        className="text-2xl tracking-tight text-(--color-stamp-chocolate)"
      >
        {t("title")}
      </Heading>
      <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
        {t("description")}
      </Paragraph>
      <Button asChild variant="primary" className="mt-4">
        <Link href="/">{t("goToLogin")}</Link>
      </Button>
    </div>
  );
}
