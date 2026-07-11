"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { Login } from "@/features/auth/login/Login";
import { useUser, useLogout } from "@/queries/authQueries";
import { ShoppingCart } from "lucide-react";

/**
 * StampHeader
 *
 * Fixed header for the Stamp flow.
 * Contains branding, navigation, auth state, and primary CTA.
 */

interface StampHeaderProps {
  onStampItClick?: () => void;
}

export function StampHeader({ onStampItClick }: StampHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleStampIt = () => {
    if (onStampItClick) {
      onStampItClick();
      return;
    }

    if (pathname !== "/stamp") {
      router.push("/stamp");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-24 px-6 lg:px-12 z-50 bg-(--color-stamp-off-white)/80 backdrop-blur-md border-b border-(--color-stamp-divider) flex items-center justify-between">
      {/* Logo */}
      <div className="flex-1">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight uppercase text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) transition-colors"
          aria-label="Return to Stamp homepage"
        >
          STAMP IT
        </Link>
      </div>

      {/* Center CTA */}
      <div className="flex-none">
        <Button
          variant="ghost"
          onClick={handleStampIt}
          className="px-8 py-3 rounded-lg h-auto btn-gradient-border animate-pulse-subtle transition-all duration-500 hover:scale-105"
          aria-label="Start stamping process"
        >
          <Span variant="micro" className="text-(--color-stamp-chocolate)">
            Stamp
          </Span>
        </Button>
      </div>

      {/* Navigation Links */}
      <nav
        className="flex-1 flex justify-end gap-8 lg:gap-10 items-center"
        aria-label="Main navigation"
      >
        {user && (
          <>
            <Link
              href="/dashboard"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/orders"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) transition-colors"
            >
              Orders
            </Link>
            <Link
              href="/cart"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Cart
            </Link>
          </>
        )}

        {user ? (
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) hover:bg-transparent transition-colors h-auto p-0 rounded-none"
            aria-label="Logout"
          >
            {logoutMutation.isPending ? "Logging Out" : "Logout"}
          </Button>
        ) : (
          <Login className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) transition-colors">
            Login
          </Login>
        )}
      </nav>
    </header>
  );
}
