"use client";

import { navbarTheme } from "@/theme/components";
import { ViewTransitionLink } from "@/features/ui/view-transition-link";

export function NavbarBrand() {
  return (
    <ViewTransitionLink href="/" className={navbarTheme.brand.link}>
      <span className={navbarTheme.brand.text}>
        Stamp
        <span className={navbarTheme.brand.dot} />
        AI
      </span>
    </ViewTransitionLink>
  );
}
