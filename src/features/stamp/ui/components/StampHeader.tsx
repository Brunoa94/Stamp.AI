"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { Login } from "@/features/auth/login/Login";
import { useUser, useLogout } from "@/queries/authQueries";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useScrolled } from "@/hooks/useScrolled";

/**
 * StampHeader
 *
 * Fixed header for the Stamp flow.
 * Contains branding, navigation, auth state, and primary CTA.
 * Collapses to a hamburger drawer below the `lg` breakpoint, where the inline
 * nav + centre CTA no longer fit (logo wraps / links overflow / CTA overlaps).
 */

interface StampHeaderProps {
  onStampItClick?: () => void;
}

export function StampHeader({ onStampItClick }: StampHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useUser();
  const logoutMutation = useLogout();
  const isScrolled = useScrolled(24);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  const handleStampIt = () => {
    setMobileMenuOpen(false);
    if (onStampItClick) {
      onStampItClick();
      return;
    }

    if (pathname !== "/stamp") {
      router.push("/stamp");
    }
  };

  const linkClass =
    "text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) transition-colors";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex h-24 items-center justify-between px-6 lg:px-12 transition-all duration-300 ${
          isScrolled || mobileMenuOpen
            ? "bg-(--color-stamp-off-white)/80 backdrop-blur-md border-b border-(--color-stamp-divider)"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        {/* Logo */}
        <div className="flex-1">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight uppercase text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) transition-colors whitespace-nowrap"
            aria-label="Return to Stamp homepage"
          >
            STAMP IT
          </Link>
        </div>

        {/* Center CTA (lg+) */}
        <div className="flex-none hidden lg:block">
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

        {/* Navigation Links (lg+) */}
        <nav
          className="flex-1 hidden lg:flex justify-end gap-8 lg:gap-10 items-center"
          aria-label="Main navigation"
        >
          {user && (
            <>
              <Link href="/dashboard" className={linkClass}>
                Dashboard
              </Link>
              <Link href="/orders" className={linkClass}>
                Orders
              </Link>
              <Link href="/cart" className={`${linkClass} flex items-center gap-2`}>
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
            <Login className={linkClass}>Login</Login>
          )}
        </nav>

        {/* Mobile/tablet hamburger (below lg) */}
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="lg:hidden flex-none p-2 -mr-2 text-(--color-stamp-chocolate)"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile/tablet drawer (below lg) */}
      <div
        className={`lg:hidden fixed top-24 left-0 right-0 z-40 bg-(--color-stamp-off-white) border-b border-(--color-stamp-divider) shadow-lg transition-all duration-300 ${
          mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <nav
          className="flex flex-col gap-1 p-6"
          aria-label="Mobile navigation"
        >
          <Button
            variant="ghost"
            onClick={handleStampIt}
            className="justify-start px-4 py-3 rounded-lg h-auto btn-gradient-border w-full mb-2"
            aria-label="Start stamping process"
          >
            <Span variant="micro" className="text-(--color-stamp-chocolate)">
              Stamp
            </Span>
          </Button>

          {user && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`${linkClass} py-3`}
              >
                Dashboard
              </Link>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={`${linkClass} py-3`}
              >
                Orders
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className={`${linkClass} py-3 flex items-center gap-2`}
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
              className="justify-start text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) hover:bg-transparent transition-colors h-auto p-0 py-3 rounded-none"
              aria-label="Logout"
            >
              {logoutMutation.isPending ? "Logging Out" : "Logout"}
            </Button>
          ) : (
            <Login className={`${linkClass} py-3 text-left`}>Login</Login>
          )}
        </nav>
      </div>
    </>
  );
}
