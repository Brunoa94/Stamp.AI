import type { Metadata } from "next";
import { notFoundTheme } from "@/theme/components";
import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { PAGE_METADATA_CONFIGS } from "@/features/seo/metadata/pageConfigs";

export const metadata: Metadata = {
  title: PAGE_METADATA_CONFIGS.notFound.title,
  description: PAGE_METADATA_CONFIGS.notFound.description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  const t = useTranslations("common.notFound");

  return (
    <section className={notFoundTheme.page} aria-label={t("ariaLabel")}>
      <div className={notFoundTheme.wrapper}>
        <div className={notFoundTheme.titleRow}>
          <span className={notFoundTheme.titleIconWrap} aria-hidden="true">
            <HelpCircle className={notFoundTheme.titleIcon} />
          </span>
          <h1 className={notFoundTheme.title}>{t("title")}</h1>
        </div>

        <div className={notFoundTheme.numberWrap}>
          <span className={notFoundTheme.numberGlow}>404</span>
          <span className={notFoundTheme.numberMain}>404</span>
        </div>
      </div>
    </section>
  );
}
