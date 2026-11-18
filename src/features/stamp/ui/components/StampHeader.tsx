"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Login } from "@/features/auth/ui/components/Login";
import { Register } from "@/features/auth/ui/components/Register";
import { useUser, useLogout } from "@/shared/queries/authQueries";
import { isRegisteredUser } from "@/shared/helpers/authIdentity";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";
import { LayoutGrid, Menu, Package, ShoppingBag, UserRound, X } from "lucide-react";
import { useScrolled } from "@/shared/hooks/useScrolled";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import { cn } from "@/lib/utils";
import {
  stampNavCtaVariants,
  stampNavLinkVariants,
  stampNavSignUpVariants,
} from "@/features/stamp/lib/variants/stampNavVariants";
import { StampNavIconLink } from "./StampNavIconLink";

/**
 * StampHeader
 *
 * Fixed header for the Stamp flow.
 * Contains branding, navigation, auth state, and primary CTA. Its horizontal
 * padding matches the page sections' gutter (px-6 lg:px-12 xl:px-24), so the
 * logo and the last nav item line up with the sections' content edges.
 * Collapses to a hamburger drawer below the `lg` breakpoint, where the inline
 * nav + centre CTA no longer fit (logo wraps / links overflow / CTA overlaps).
 */

export function StampHeader() {
  const t = useTranslations("stamp.header");
  const { data: user } = useUser();
  // Guests with an anonymous session see the logged-out header.
  const isRegistered = isRegisteredUser(user);
  const logoutMutation = useLogout();
  const isScrolled = useScrolled(24);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex h-24 items-center justify-between px-6 lg:px-12 xl:px-24 transition-all duration-300 ${
          isScrolled || mobileMenuOpen
            ? "bg-(--color-stamp-off-white)/80 backdrop-blur-md border-b border-(--color-stamp-divider)"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        {/* Logo */}
        <div className="flex-1">
          <Link href="/" className="block" aria-label={t("logoAria")}>
            <Image
              src={staticAssetUrl("/logo.png")}
              alt="Stamp.AI"
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
              priority
            />
          </Link>
        </div>

        {/* Center CTA (lg+) */}
        <div className="flex-none hidden lg:block mx-6">
          <Link
            href="/stamp"
            className={cn(stampNavCtaVariants(), "px-8 py-3")}
            aria-label={t("stampAria")}
          >
            {t("stamp")}
          </Link>
        </div>

        {/* Navigation Links (lg+) */}
        <nav
          className="flex-1 hidden lg:flex justify-end gap-4 xl:gap-6 items-center"
          aria-label={t("mainNavAria")}
        >
          <StampNavIconLink href="/catalog" icon={LayoutGrid} label={t("catalog")} />

          {isRegistered && (
            <StampNavIconLink href="/orders" icon={Package} label={t("orders")} compact />
          )}

          <div className="flex items-center gap-1">
            <LanguageSwitcher className="mr-2" />
            {isRegistered && (
              <StampNavIconLink href="/profile" icon={UserRound} label={t("profile")} iconOnly />
            )}
            <StampNavIconLink href="/cart" icon={ShoppingBag} label={t("cart")} iconOnly />
          </div>

          {isRegistered ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className={cn(stampNavLinkVariants(), "hover:bg-transparent")}
              aria-label={t("logoutAria")}
            >
              {t("logout")}
            </Button>
          ) : (
            <>
              <Login className={stampNavLinkVariants()}>{t("signIn")}</Login>
              <Register className={stampNavSignUpVariants()}>{t("signUp")}</Register>
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
            className={cn(stampNavCtaVariants(), "w-full mb-4 px-4 py-2.5")}
            aria-label={t("stampAria")}
          >
            {t("stamp")}
          </Link>

          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(stampNavLinkVariants(), "py-3")}
          >
            {t("catalog")}
          </Link>

          <Link
            href="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(stampNavLinkVariants(), "py-3")}
          >
            {t("cart")}
          </Link>

          {isRegistered && (
            <>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(stampNavLinkVariants(), "py-3")}
              >
                {t("orders")}
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(stampNavLinkVariants(), "py-3")}
              >
                {t("profile")}
              </Link>
            </>
          )}

          {isRegistered ? (
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
              <Login className={cn(stampNavLinkVariants(), "py-3 text-left")}>
                {t("signIn")}
              </Login>
              <Register className={cn(stampNavLinkVariants(), "py-3 text-left")}>
                {t("signUp")}
              </Register>
            </>
          )}

          {mobileMenuOpen && <LanguageSwitcher className="mt-3 self-start" />}
        </nav>
      </div>
    </>
  );
}
