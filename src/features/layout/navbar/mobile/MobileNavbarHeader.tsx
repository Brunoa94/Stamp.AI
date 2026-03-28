"use client";

import { Menu, ShoppingCart, Wand2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { navbarTheme } from "@/theme/components";
import { NavbarBrand } from "../NavbarBrand";
import { ViewTransitionLink } from "@/features/ui/view-transition-link";

interface Props {
  itemCount: number;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
}

export function MobileNavbarHeader({
  itemCount,
  isMenuOpen,
  onOpenMenu,
}: Props) {
  const mobileHeader = navbarTheme.mobileHeader;

  return (
    <div className={mobileHeader.row}>
      <div onClick={(e) => e.stopPropagation()}>
        <NavbarBrand />
      </div>

      <Button
        asChild
        className={cn(
          navbarTheme.navigation.stampButton,
          mobileHeader.stampCta,
        )}
      >
        <ViewTransitionLink href="/stamp" aria-label="Create a new stamp design">
          <Wand2 className="w-3.5 h-3.5" />
          <span className="text-lg">Stamp It!</span>
        </ViewTransitionLink>
      </Button>
      <div className="flex items-center">
        <Button asChild variant="ghost" className={mobileHeader.cartButton}>
          <ViewTransitionLink href="/cart" aria-label="View cart">
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
              <span className={mobileHeader.badge}>
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </ViewTransitionLink>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          className={cn(
            navbarTheme.actions.themeButton,
            mobileHeader.menuButton,
          )}
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
