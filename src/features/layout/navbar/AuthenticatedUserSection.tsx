"use client";

import { Button } from "@/features/ui/button";
import { useTranslations } from "next-intl";
import { useLogout } from "@/hooks/useAuth";
import { LogOut, ShoppingCart } from "lucide-react";
import clsx from "clsx";
import { navbarTheme } from "@/theme/components";
import { useCartSummary } from "@/queries/cartQueries";
import { useViewTransitionNavigate } from "@/features/ui/view-transition-link";

export function AuthenticatedUserSection() {
  const t = useTranslations("layout.userSection");
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
        aria-label={t("viewCart")}
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
        aria-label={t("signOutAria")}
      >
        <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span className="hidden lg:inline">
          {logoutMutation.isPending ? t("signingOut") : t("signOut")}
        </span>
      </Button>
    </div>
  );
}
