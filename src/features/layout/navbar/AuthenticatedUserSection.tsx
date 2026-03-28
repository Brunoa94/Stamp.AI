"use client";

import { Button } from "@/features/ui/button";
import { useLogout } from "@/hooks/useAuth";
import { Moon, User, ShoppingCart } from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { navbarTheme } from "@/theme/components";
import { useCartSummary } from "@/queries/cartQueries";
import { CoinsBadge } from "./CoinsBadge";
import { useViewTransitionNavigate } from "@/features/ui/view-transition-link";

export function AuthenticatedUserSection() {
  const logoutMutation = useLogout();
  const navigate = useViewTransitionNavigate();
  const { setTheme, theme } = useTheme();
  const { itemCount } = useCartSummary();

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={navbarTheme.actions.container}>
      <CoinsBadge />

      <Button
        onClick={toggleTheme}
        variant="ghost"
        size="icon"
        className={navbarTheme.actions.themeButton}
        aria-label="Toggle theme"
      >
        <Moon className="w-7 h-7" />
      </Button>

      <Button
        onClick={() => navigate("/cart")}
        variant="ghost"
        size="icon"
        className={clsx(navbarTheme.actions.themeButton, "relative")}
        aria-label="View cart"
      >
        <ShoppingCart className="w-7 h-7" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-linear-to-r from-purple-600 via-pink-600 to-red-600 text-white text-[10px] font-bold rounded-full min-w-4.5 h-4.5 px-1 flex items-center justify-center">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Button>

      <div className={navbarTheme.actions.divider} />

      <Button
        onClick={() => navigate("/profile")}
        variant="ghost"
        size="icon"
        className={navbarTheme.actions.profileButton}
        aria-label="View profile"
      >
        <div className={navbarTheme.actions.profileIcon}>
          <User className="w-7 h-7" />
        </div>
      </Button>

      <Button
        onClick={handleSignOut}
        disabled={logoutMutation.isPending}
        variant="destructive"
        className={clsx(
          navbarTheme.actions.signOutButton,
          logoutMutation.isPending && "opacity-50 cursor-not-allowed",
        )}
      >
        {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
}
