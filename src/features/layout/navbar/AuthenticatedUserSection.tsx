"use client";

import { Button } from "@/features/ui/button";
import { useLogout } from "@/hooks/useAuth";
import { LogOut, User, ShoppingCart } from "lucide-react";
import clsx from "clsx";
import { navbarTheme } from "@/theme/components";
import { useCartSummary } from "@/queries/cartQueries";
import { CoinsBadge } from "./CoinsBadge";
import { useViewTransitionNavigate } from "@/features/ui/view-transition-link";

export function AuthenticatedUserSection() {
  const logoutMutation = useLogout();
  const navigate = useViewTransitionNavigate();
  const { itemCount } = useCartSummary();

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={navbarTheme.actions.container}>
      <CoinsBadge className={navbarTheme.actions.coinsBadge} />

      <Button
        onClick={() => navigate("/cart")}
        variant="ghost"
        size="icon"
        className={navbarTheme.actions.themeButton}
        aria-label="View cart"
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className={navbarTheme.actions.cartBadge}>
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Button>

      <Button
        onClick={() => navigate("/profile")}
        variant="ghost"
        className={navbarTheme.actions.profileButton}
        aria-label="View profile"
      >
        <div className={navbarTheme.actions.profileIcon}>
          <User className="w-4 h-4" />
        </div>
        <div className={navbarTheme.actions.profileMeta}>
          <span className={navbarTheme.actions.profileAmount}>$ 3</span>
        </div>
      </Button>

      <div className={navbarTheme.actions.divider} />

      <Button
        onClick={handleSignOut}
        disabled={logoutMutation.isPending}
        variant="ghost"
        className={clsx(
          navbarTheme.actions.signOutButton,
          logoutMutation.isPending && "opacity-50 cursor-not-allowed",
        )}
      >
        <LogOut className="w-4 h-4" />
        <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
      </Button>
    </div>
  );
}
