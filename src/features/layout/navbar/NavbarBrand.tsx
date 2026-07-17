"use client";

import { useTranslations } from "next-intl";
import { navbarTheme } from "@/theme/components";
import { ViewTransitionLink } from "@/features/ui/view-transition-link";

export function NavbarBrand() {
  const t = useTranslations("layout.navbar");

  return (
    <ViewTransitionLink href="/" className={navbarTheme.brand.link}>
      <span className={navbarTheme.brand.text}>
        {t.rich("brand", {
          dot: () => <span className={navbarTheme.brand.dot} />,
        })}
      </span>
    </ViewTransitionLink>
  );
}
