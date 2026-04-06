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
import { useUser } from "@/queries/authQueries";

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
          isScrolled
            ? navbarTheme.desktop.scrolled
            : navbarTheme.desktop.transparent,
        )}
        style={{ viewTransitionName: "main-nav" }}
      >
        <div className={navbarTheme.desktop.topAccent} />

        <div className={navbarTheme.inner}>
          <div className={navbarTheme.content}>
            <div className={navbarTheme.desktop.brandSlot}>
              <NavbarBrand />
            </div>

            <div className={navbarTheme.desktop.centerSlot}>
              {isAuthenticated && <NavbarLinks />}
            </div>

            <div className={navbarTheme.desktop.actionsSlot}>
              {isAuthenticated ? (
                <AuthenticatedUserSection />
              ) : (
                <UnauthenticatedUserSection />
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
