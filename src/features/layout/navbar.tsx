"use client";

import { NavbarBrand } from "./navbar/NavbarBrand";
import { NavItem } from "./navbar/NavItem";
import { StampItButton } from "./navbar/StampItButton";
import { Button } from "@/features/ui/button";
import { Package, Home, ShoppingCart, LogOut, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/features/ui/theme-toggle";
import { useCartSummary } from "@/queries/cartQueries";
import { useLogout, useIsAuthenticated } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount } = useCartSummary();
  const logoutMutation = useLogout();
  const { isAuthenticated } = useIsAuthenticated();

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  const isOrdersPage = pathname === "/orders";
  const isStampPage = pathname === "/stamp";
  const isDashboardPage = pathname === "/dashboard";
  const isProfilePage = pathname === "/profile";

  return (
    <nav className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b-2 border-purple-200 dark:border-purple-700 px-4 py-4 fixed top-0 left-0 right-0 z-50 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left - Brand */}
        <NavbarBrand />

        {/* Center - Navigation Links (only show when authenticated) */}
        {isAuthenticated && (
          <nav className="flex items-center gap-3">
            <NavItem
              label="My Orders"
              icon={Package}
              isActive={isOrdersPage}
              onClick={() => router.push("/orders")}
            />

            <StampItButton
              isActive={isStampPage}
              onClick={() => router.push("/stamp")}
            />

            <NavItem
              label="Dashboard"
              icon={Home}
              isActive={isDashboardPage}
              onClick={() => router.push("/dashboard")}
            />
          </nav>
        )}

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push("/cart")}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium relative px-3 py-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-linear-to-r from-purple-600 via-pink-600 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Button>
              <NavItem
                label=""
                icon={User}
                onClick={() => router.push("/profile")}
                isActive={isProfilePage}
              />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium px-3 py-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                </span>
              </Button>
            </>
          )}
          {!isAuthenticated && <ThemeToggle />}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
