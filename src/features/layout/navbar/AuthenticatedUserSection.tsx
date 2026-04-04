"use client";

import { Button } from "@/features/ui/button";
import { useLogout } from "@/hooks/useAuth";
import { LogOut, ShoppingCart } from "lucide-react";
import clsx from "clsx";
import { navbarTheme } from "@/theme/components";
import { useCartSummary } from "@/queries/cartQueries";
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
      <Button
        onClick={() => navigate("/cart")}
        variant="ghost"
        size="icon"
        className={navbarTheme.actions.cartButton}
        aria-label="View cart"
      >
        <ShoppingCart className={navbarTheme.actions.cartIcon} />
        {itemCount > 0 && (
          <span className={navbarTheme.actions.cartBadge}>
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
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
