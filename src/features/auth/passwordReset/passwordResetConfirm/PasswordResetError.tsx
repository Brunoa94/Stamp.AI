import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function PasswordResetError() {
  const t = useTranslations("auth.passwordReset.error");

  return (
    <div className="text-center space-y-6">
      <div className="text-(--color-stamp-error) mb-4">
        <AlertCircle className="w-16 h-16 mx-auto" strokeWidth={1.5} />
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
      <Button asChild variant="secondary">
        <Link href="/">{t("backToHome")}</Link>
      </Button>
    </div>
  );
}
