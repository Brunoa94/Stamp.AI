"use client";

import { navbarTheme } from "@/theme/components";
import { ViewTransitionLink } from "@/features/ui/view-transition-link";

export function NavbarGuestCta() {
  return (
    <ViewTransitionLink
      href="/stamp"
      className={navbarTheme.navigation.stampButton}
    >
      Stamp It!
    </ViewTransitionLink>
  );
}
