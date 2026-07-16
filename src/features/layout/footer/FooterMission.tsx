import { useTranslations } from "next-intl";
import { footerTheme } from "@/theme/components";

export function FooterMission() {
  const t = useTranslations("layout.footerMission");

  return (
    <div className="col-span-1">
      <h3 className={footerTheme.missionTitle}>{t("title")}</h3>
      <p className={footerTheme.missionText}>{t("text")}</p>
    </div>
  );
}
