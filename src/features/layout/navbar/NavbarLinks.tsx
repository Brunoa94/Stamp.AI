"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { navbarTheme } from "@/theme/components";
import { ViewTransitionLink } from "@/features/ui/view-transition-link";
import { useUser } from "@/queries/authQueries";

export function NavbarLinks() {
  const t = useTranslations("layout.navbar");
  const pathname = usePathname();
  const isOrdersActive = pathname === "/orders";
  const isStampActive = pathname === "/stamp";
  const isDashboardActive = pathname === "/dashboard";
  const { data: user } = useUser();
  const displayName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || null;

  return (
    <div className={navbarTheme.navigation.container}>
      <ViewTransitionLink
        href="/orders"
        className={clsx(
          navbarTheme.navigation.link.base,
          isOrdersActive
            ? navbarTheme.navigation.link.active
            : navbarTheme.navigation.link.inactive,
        )}
      >
        <span className="hidden lg:inline">{t("myOrders")}</span>
        <span className="lg:hidden">{t("orders")}</span>
      </ViewTransitionLink>

      <ViewTransitionLink
        href="/stamp"
        className={navbarTheme.navigation.stampButton}
      >
        <span
          className={clsx(
            isStampActive && navbarTheme.navigation.stampButtonActive,
          )}
        >
          {/* Show personalized label only on larger screens */}
          <span className="hidden lg:inline">
            {displayName
              ? t("stampItPersonalized", { name: displayName })
              : t("stampIt")}
          </span>
          <span className="lg:hidden">{t("stampIt")}</span>
        </span>
      </ViewTransitionLink>

      <ViewTransitionLink
        href="/dashboard"
        className={clsx(
          navbarTheme.navigation.link.base,
          isDashboardActive
            ? navbarTheme.navigation.link.active
            : navbarTheme.navigation.link.inactive,
        )}
      >
        {t("dashboard")}
      </ViewTransitionLink>
    </div>
  );
}
