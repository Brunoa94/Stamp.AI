"use client";

import { Button } from "@/features/ui/button";
import { useLogout } from "@/hooks/useAuth";
import { useUser } from "@/queries/authQueries";
import { LogOut, ShoppingCart } from "lucide-react";
import clsx from "clsx";
import { navbarTheme } from "@/theme/components";
import { useCartSummary } from "@/queries/cartQueries";
import { useViewTransitionNavigate } from "@/features/ui/view-transition-link";

export function AuthenticatedUserSection() {
  const logoutMutation = useLogout();
  const navigate = useViewTransitionNavigate();
  const { itemCount } = useCartSummary();
  const { data: user } = useUser();
  const displayName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || null;
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
      {displayName && (
        <span className="flex flex-col leading-none">
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40 dark:text-white/40">
            Welcome back
          </span>
          <span className="text-sm font-bold text-violet-600 dark:text-violet-400 truncate max-w-30">
            {displayName}
          </span>
        </span>
      )}
    </div>
  );
}
