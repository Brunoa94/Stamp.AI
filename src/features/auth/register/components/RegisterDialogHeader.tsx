import { useTranslations } from "next-intl";
import { AuthModalHeader } from "@/features/ui/dialog/AuthModalHeader";
import { Paragraph } from "@/features/ui/paragraph";

export function RegisterDialogHeader() {
  const t = useTranslations("auth.register.header");

  return (
    <div>
      <AuthModalHeader label={t("label")} title={t("title")} />
      <Paragraph variant="sm" className="text-(--color-stamp-taupe) mb-2">
        {t("tagline")}
      </Paragraph>
    </div>
  );
}
