"use client";

import { NavbarBrand } from "./navbar/NavbarBrand";
import { NavbarLinks } from "./navbar/NavbarLinks";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { navbarTheme } from "@/theme/components";
import { AuthenticatedUserSection } from "./navbar/AuthenticatedUserSection";
import { UnauthenticatedUserSection } from "./navbar/UnauthenticatedUserSection";
import { cn } from "@/lib/utils";

function Navbar() {
  const { isAuthenticated } = useIsAuthenticated();

  return (
    <nav
      id="global-nav"
      className={cn(navbarTheme.container, "sticky top-0 z-50 w-full")}
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
