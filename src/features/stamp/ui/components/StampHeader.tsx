"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Login } from "@/features/auth/login/Login";
import { Register } from "@/features/auth/register/Register";
import { useUser, useLogout } from "@/shared/queries/authQueries";
import { Menu, X } from "lucide-react";
import { useScrolled } from "@/shared/hooks/useScrolled";

/**
 * StampHeader
 *
 * Fixed header for the Stamp flow.
 * Contains branding, navigation, auth state, and primary CTA.
 * Collapses to a hamburger drawer below the `lg` breakpoint, where the inline
 * nav + centre CTA no longer fit (logo wraps / links overflow / CTA overlaps).
 */

export function StampHeader() {
  const t = useTranslations("stamp.header");
  const { data: user } = useUser();
  const logoutMutation = useLogout();
  const isScrolled = useScrolled(24);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  const linkClass =
    "font-semibold text-sm uppercase tracking-wider text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) transition-all duration-300";

  // Mirrors the hero upload card so the nav CTA reads as the same "start here" action
  const stampCtaClass =
    "group inline-flex items-center justify-center rounded-lg border-3 border-dashed border-(--color-stamp-gold) bg-(--color-stamp-gold)/10 text-lg leading-none font-bold uppercase tracking-wider text-(--color-stamp-chocolate) shadow-lg ring-4 ring-(--color-stamp-gold)/20 transition-all duration-300 animate-stamp-press hover:animate-none hover:-translate-y-0.5 hover:border-solid hover:bg-(--color-stamp-white) hover:shadow-xl hover:ring-(--color-stamp-gold)/35 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-(--color-stamp-gold)/50";

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
          <Link href="/" className="block" aria-label={t("logoAria")}>
            <Image
              src="/logo.png"
              alt="Stamp.AI"
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
              priority
            />
          </Link>
        </div>

        {/* Center CTA (lg+) */}
        <div className="flex-none hidden lg:block">
          <Link
            href="/stamp"
            className={`${stampCtaClass} px-8 py-3`}
            aria-label={t("stampAria")}
          >
            {t("stamp")}
          </Link>
        </div>

        {/* Navigation Links (lg+) */}
        <nav
          className="flex-1 hidden lg:flex justify-end gap-8 lg:gap-10 items-center"
          aria-label={t("mainNavAria")}
        >
          <Link href="/catalog" className={linkClass}>
            {t("catalog")}
          </Link>

          {user && (
            <>
              <Link href="/orders" className={linkClass}>
                {t("orders")}
              </Link>
              <Link href="/cart" className={linkClass}>
                {t("cart")}
              </Link>
              <Link
                href="/profile"
                className={linkClass}
                aria-label={t("profileAria")}
              >
                {t("profile")}
              </Link>
            </>
          )}

          {user ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className={`${linkClass} hover:bg-transparent`}
              aria-label={t("logoutAria")}
            >
              {t("logout")}
            </Button>
          ) : (
            <>
              <Login className={linkClass}>{t("signIn")}</Login>
              <Register className={linkClass}>{t("signUp")}</Register>
            </>
          )}
        </nav>

        {/* Mobile/tablet hamburger (below lg) */}
        <Button
          variant="unstyled"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="lg:hidden flex-none p-2 -mr-2 text-(--color-stamp-chocolate) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) focus-visible:ring-offset-2"
          aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </header>

      {/* Mobile/tablet drawer (below lg) */}
      <div
        className={`lg:hidden fixed top-24 left-0 right-0 z-40 bg-(--color-stamp-off-white) border-b border-(--color-stamp-divider) shadow-lg transition-all duration-300 ${
          mobileMenuOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <nav
          className="flex flex-col gap-1 p-6"
          aria-label={t("mobileNavAria")}
        >
          <Link
            href="/stamp"
            onClick={() => setMobileMenuOpen(false)}
            className={`${stampCtaClass} w-full mb-4 px-4 py-2.5`}
            aria-label={t("stampAria")}
          >
            {t("stamp")}
          </Link>

          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className={`${linkClass} py-3`}
          >
            {t("catalog")}
          </Link>

          {user && (
            <>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={`${linkClass} py-3`}
              >
                {t("orders")}
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className={`${linkClass} py-3`}
              >
                {t("cart")}
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`${linkClass} py-3`}
                aria-label={t("profileAria")}
              >
                {t("profile")}
              </Link>
            </>
          )}

          {user ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="justify-start font-semibold text-sm uppercase tracking-wider text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) hover:bg-transparent transition-all duration-300 h-auto p-0 py-3"
              aria-label={t("logoutAria")}
            >
              {t("logout")}
            </Button>
          ) : (
            <>
              <Login className={`${linkClass} py-3 text-left`}>
                {t("signIn")}
              </Login>
              <Register className={`${linkClass} py-3 text-left`}>
                {t("signUp")}
              </Register>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
