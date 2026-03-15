"use client";

import { NavbarBrand } from "./navbar/NavbarBrand";
import { NavbarLinks } from "./navbar/NavbarLinks";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { useScrolled } from "@/hooks/useScrolled";
import { navbarTheme } from "@/theme/components";
import { AuthenticatedUserSection } from "./navbar/AuthenticatedUserSection";
import { UnauthenticatedUserSection } from "./navbar/UnauthenticatedUserSection";
import { cn } from "@/lib/utils";
import { MobileNavbar } from "./navbar/mobile";

function Navbar() {
  const { isAuthenticated } = useIsAuthenticated();
  const isScrolled = useScrolled(50);

  return (
    <>
      {/* Mobile navbar (below md) */}
      {isAuthenticated && <MobileNavbar />}

      {/* Desktop navbar (md and above) */}
      <nav
        id="global-nav"
        className={cn(
          navbarTheme.container,
          navbarTheme.desktop.base,
          isScrolled ? navbarTheme.desktop.scrolled : navbarTheme.desktop.transparent,
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
    </>
  );
}

export default Navbar;
