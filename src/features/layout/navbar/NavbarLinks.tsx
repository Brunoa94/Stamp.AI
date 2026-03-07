"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navbarTheme } from "@/theme/components";

export function NavbarLinks() {
  const pathname = usePathname();
  const isOrdersActive = pathname === "/orders";
  const isDashboardActive = pathname === "/dashboard";

  return (
    <div className={navbarTheme.navigation.container}>
      <Link
        href="/orders"
        className={clsx(
          navbarTheme.navigation.link.base,
          isOrdersActive
            ? navbarTheme.navigation.link.active
            : navbarTheme.navigation.link.inactive,
        )}
      >
        My Orders
      </Link>

      <Link href="/stamp" className={navbarTheme.navigation.stampButton}>
        Stamp It!
      </Link>

      <Link
        href="/dashboard"
        className={clsx(
          navbarTheme.navigation.link.base,
          isDashboardActive
            ? navbarTheme.navigation.link.active
            : navbarTheme.navigation.link.inactive,
        )}
      >
        Dashboard
      </Link>
    </div>
  );
}
