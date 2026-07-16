"use client";

import { useTranslations } from "next-intl";
import { navbarTheme } from "@/theme/components";
import { ViewTransitionLink } from "@/features/ui/view-transition-link";

export function NavbarGuestCta() {
  const t = useTranslations("layout.navbar");

  return (
    <ViewTransitionLink
      href="/stamp"
      className={`${navbarTheme.navigation.stampButton} text-xl`}
    >
      {t("stampIt")}
    </ViewTransitionLink>
  );
}
