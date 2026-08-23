import { notFoundTheme } from "@/theme/components";
import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

export default function NotFound() {
  const t = useTranslations("common.notFound");

  return (
    <section className={notFoundTheme.page} aria-label={t("ariaLabel")}>
      <div className={notFoundTheme.wrapper}>
        <div className={notFoundTheme.titleRow}>
          <Span variant="default" className={notFoundTheme.titleIconWrap} aria-hidden="true">
            <HelpCircle className={notFoundTheme.titleIcon} />
          </Span>
          <Heading as="h1" variant="title" className={notFoundTheme.title}>
            {t("title")}
          </Heading>
        </div>

        <div className={notFoundTheme.numberWrap}>
          <Span variant="default" className={notFoundTheme.numberGlow}>404</Span>
          <Span variant="default" className={notFoundTheme.numberMain}>404</Span>
        </div>
      </div>
    </section>
  );
}
