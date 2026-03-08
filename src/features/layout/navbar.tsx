"use client";

import { NavbarBrand } from "./navbar/NavbarBrand";
import { NavbarLinks } from "./navbar/NavbarLinks";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { useScrolled } from "@/hooks/useScrolled";
import { navbarTheme } from "@/theme/components";
import { AuthenticatedUserSection } from "./navbar/AuthenticatedUserSection";
import { UnauthenticatedUserSection } from "./navbar/UnauthenticatedUserSection";
import { cn } from "@/lib/utils";

// Static style constants defined outside component
const navbarStyles = {
  base: "sticky top-0 z-50 w-full transition-[background-color,backdrop-filter,border-color,box-shadow,transform] duration-500 ease-out",
  scrolled:
    "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-white/30 dark:border-gray-700/30 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]",
  transparent: "bg-transparent",
};

function Navbar() {
  const { isAuthenticated } = useIsAuthenticated();
  const isScrolled = useScrolled(50);

  return (
    <nav
      id="global-nav"
      className={cn(
        navbarTheme.container,
        navbarStyles.base,
        isScrolled ? navbarStyles.scrolled : navbarStyles.transparent,
      )}
      style={{ viewTransitionName: "main-nav" }}
    >
      <div className={navbarTheme.inner}>
        <div className={navbarTheme.content}>
          {/* Logo */}
          <NavbarBrand />

          {/* Navigation Links (only when authenticated) */}
          {isAuthenticated && <NavbarLinks />}

          {/* User Actions */}
          {isAuthenticated ? (
            <AuthenticatedUserSection />
          ) : (
            <UnauthenticatedUserSection />
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
