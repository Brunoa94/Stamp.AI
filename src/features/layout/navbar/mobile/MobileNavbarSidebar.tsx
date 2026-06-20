"use client";

import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import { useUser } from "@/queries/authQueries";
import { useTheme } from "next-themes";
import { Button } from "@/features/ui/button";
import { navbarTheme } from "@/theme/components";
import { NavbarBrand } from "../NavbarBrand";
import { MobileNavbarSidebarProfile } from "./MobileNavbarSidebarProfile";
import { MobileNavbarSidebarThemeToggle } from "./MobileNavbarSidebarThemeToggle";
import { MobileNavbarSidebarNavigation } from "./MobileNavbarSidebarNavigation";
import { MobileNavbarSidebarSignOut } from "./MobileNavbarSidebarSignOut";
import { CoinsBadge } from "../CoinsBadge";
import { useViewTransitionNavigate } from "@/features/ui/view-transition-link";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavbarSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const navigate = useViewTransitionNavigate();
  const logoutMutation = useLogout();
  const { data: user } = useUser();
  const { setTheme, theme } = useTheme();
  const isDark = theme === "dark";

  const handleSignOut = () => {
    logoutMutation.mutate();
    onClose();
  };

  const handleNav = (href: string) => {
    navigate(href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={navbarTheme.mobileSidebar.root}>
      {/* Backdrop */}
      <div
        className={navbarTheme.mobileSidebar.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div className={navbarTheme.mobileSidebar.panel}>
        {/* Panel header */}
        <div className={navbarTheme.mobileSidebar.panelHeader}>
          <div onClick={onClose}>
            <NavbarBrand />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={navbarTheme.mobileSidebar.closeButton}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Nav links */}
        <nav className={navbarTheme.mobileSidebar.nav}>
          <MobileNavbarSidebarNavigation
            pathname={pathname}
            onNavigate={handleNav}
          />

          <MobileNavbarSidebarProfile
            user={user}
            onOpenProfile={() => handleNav("/profile")}
          />

          <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-3">
            <CoinsBadge />
            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">credits</span>
          </div>

          <MobileNavbarSidebarThemeToggle
            isDark={isDark}
            onToggleTheme={() => setTheme(isDark ? "light" : "dark")}
          />
        </nav>

        {/* Sign out */}
        <div className={navbarTheme.mobileSidebar.footer}>
          <MobileNavbarSidebarSignOut
            isPending={logoutMutation.isPending}
            onSignOut={handleSignOut}
          />
        </div>
      </div>
    </div>
  );
}
