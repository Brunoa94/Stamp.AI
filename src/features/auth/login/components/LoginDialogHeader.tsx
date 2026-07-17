import { useTranslations } from "next-intl";
import { AuthModalHeader } from "@/features/ui/dialog/AuthModalHeader";

export function LoginDialogHeader() {
  const t = useTranslations("auth.login.header");

  return <AuthModalHeader label={t("label")} title={t("title")} />;
}
