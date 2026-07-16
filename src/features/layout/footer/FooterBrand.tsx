import { useTranslations } from "next-intl";
import { footerTheme } from "@/theme/components";

export function FooterBrand() {
  const t = useTranslations("layout.footerBrand");

  return (
    <div className={footerTheme.brandWrap}>
      <h2 className={footerTheme.brandText}>
        {t.rich("brand", {
          dot: () => (
            <span className={footerTheme.brandDot} aria-hidden="true" />
          ),
        })}
      </h2>
    </div>
  );
}
