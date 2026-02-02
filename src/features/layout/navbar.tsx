"use client";

import { NavbarBrand } from "./navbar/NavbarBrand";
import { Button } from "@/features/ui/button";
import { Package, Home, ShoppingCart, LogOut, Sparkles } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/features/ui/theme-toggle";
import { useCartSummary } from "@/hooks/useCart";
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

  return (
    <nav className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b-2 border-purple-200 dark:border-purple-700 px-4 py-4 fixed top-0 left-0 right-0 z-50 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left - Brand */}
        <NavbarBrand />

        {/* Center - Navigation Links (only show when authenticated) */}
        {isAuthenticated && (
          <nav className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/orders")}
              variant="ghost"
              className={cn(
                "flex items-center gap-2 font-semibold px-4 py-2",
                isOrdersPage && "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
                !isOrdersPage && "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
              )}
            >
              <Package className="w-5 h-5" />
              My Orders
            </Button>

            {/* Stamp - Animated Main Link */}
            <Button
              onClick={() => router.push("/stamp")}
              variant="ghost"
              className={cn(
                "flex items-center gap-2 font-bold px-6 py-3 relative group transition-all duration-300",
                isStampPage && "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50 scale-110",
                !isStampPage && "hover:scale-110"
              )}
            >
              <Sparkles className={cn(
                "w-7 h-7 transition-transform duration-300",
                isStampPage ? "animate-pulse text-white" : "animate-[stamp-sparkle_2s_ease-in-out_infinite] text-purple-400 dark:text-purple-300"
              )} />
              <span
                className={cn(
                  "text-lg font-[family-name:var(--font-bungee)]",
                  !isStampPage && "bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 dark:from-purple-300 dark:via-pink-300 dark:to-purple-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-[stamp-gradient_3s_ease-in-out_infinite]"
                )}
                style={isStampPage ? {} : { backgroundSize: '200% auto' }}
              >
                Stamp It
              </span>
              {isStampPage && (
                <Sparkles className="w-7 h-7 animate-pulse text-white" />
              )}
            </Button>

            <Button
              onClick={() => router.push("/dashboard")}
              variant="ghost"
              className={cn(
                "flex items-center gap-2 font-semibold px-4 py-2",
                isDashboardPage && "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
                !isDashboardPage && "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
              )}
            >
              <Home className="w-5 h-5" />
              Dashboard
            </Button>
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
