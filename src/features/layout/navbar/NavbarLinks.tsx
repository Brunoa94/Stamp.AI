"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navbarTheme } from "@/theme/components";
import { ViewTransitionLink } from "@/features/ui/view-transition-link";

export function NavbarLinks() {
  const pathname = usePathname();
  const isOrdersActive = pathname === "/orders";
  const isStampActive = pathname === "/stamp";
  const isDashboardActive = pathname === "/dashboard";

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
        My Orders
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
          Stamp It!
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
        Dashboard
      </ViewTransitionLink>
    </div>
  );
}
