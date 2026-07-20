"use client";

import Link from "next/link";
import { ShoppingBag, User, LogOut, Menu, X } from "lucide-react";
import { useUser, useLogout } from "@/hooks/useAuth";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Login } from "@/features/auth/login/Login";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

export function ModernTopNavbar() {
  const t = useTranslations("layout.modernNavbar");
  const { data: user } = useUser();
  const logoutMutation = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-20 bg-concrete border-b border-ink/5 z-50 px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 md:gap-2">
          {t.rich("brand", {
            stamp: (chunks) => (
              <Span
                variant="sm"
                className="text-2xl md:text-3xl leading-none tracking-tight text-ink font-bold"
              >
                {chunks}
              </Span>
            ),
            dot: () => <span className="logo-gradient-dot" />,
            ai: (chunks) => (
              <Span
                variant="sm"
                className="text-2xl md:text-3xl leading-none tracking-tight text-ink font-bold"
              >
                {chunks}
              </Span>
            ),
          })}
        </Link>

        {/* Center CTA Button - Hidden on mobile/tablet */}
        <Button
          asChild
          variant="brutalist-primary"
          className="hidden lg:block px-10 py-4 text-lg animate-pulse-subtle"
        >
          <Link href="/stamp">{t("stampIt")}</Link>
        </Button>

        {/* Right Side - Desktop Icons */}
        <div className="hidden lg:flex items-center gap-4">
          <Button
            asChild
            variant="brutalist-ghost"
            className="action-btn-refined btn-glow-cyan icon-glow-cyan p-3.5 rounded-xl group hover:px-6"
          >
            <Link href="/cart">
              <ShoppingBag className="w-5 h-5 text-brandCyan group-hover:scale-110 transition-transform duration-300" />
              <Span
                variant="label"
                className="btn-text text-brandCyan group-hover:text-white"
              >
                {t("cart")}
              </Span>
            </Link>
          </Button>

          {user ? (
            <Button
              asChild
              variant="brutalist-ghost"
              className="action-btn-refined btn-glow-purple icon-glow-purple p-3.5 rounded-xl group hover:px-6"
            >
              <Link href="/profile">
                <User className="w-5 h-5 text-purple group-hover:scale-110 transition-transform duration-300" />
                <Span
                  variant="label"
                  className="btn-text text-purple group-hover:text-white"
                >
                  {t("account")}
                </Span>
              </Link>
            </Button>
          ) : (
            <Login
              variant="brutalist"
              className="action-btn-refined btn-glow-purple icon-glow-purple flex items-center border p-3.5 rounded-xl group hover:px-6"
            />
          )}

          {user && (
            <Button
              variant="brutalist-ghost"
              onClick={handleLogout}
              className="action-btn-refined btn-glow-orange icon-glow-orange p-3.5 rounded-xl group hover:px-6"
            >
              <LogOut className="w-5 h-5 text-orange group-hover:scale-110 transition-transform duration-300" />
              <Span
                variant="label"
                className="btn-text text-orange group-hover:text-white"
              >
                {t("logout")}
              </Span>
            </Button>
          )}
        </div>

        {/* Mobile/Tablet Menu Button */}
        <Button
          variant="ghost"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-ink"
          aria-label={t("toggleMenu")}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </header>

      {/* Desktop Navigation Menu - Below Header (Desktop only - lg breakpoint) */}
      <nav className="hidden lg:flex fixed top-32 right-10 z-40 flex-col gap-5 items-end">
        <Link href="/" className="nav-link-underline">
          <Span
            variant="sm"
            className="text-lg tracking-[0.2em] text-ink font-semibold"
          >
            {t("nav.home")}
          </Span>
        </Link>
        <Link href="/stamp" className="nav-link-underline">
          <Span
            variant="sm"
            className="text-lg tracking-[0.2em] text-ink font-semibold"
          >
            {t("nav.stamp")}
          </Span>
        </Link>
        <Link href="/orders" className="nav-link-underline">
          <Span
            variant="sm"
            className="text-lg tracking-[0.2em] text-ink font-semibold"
          >
            {t("nav.orders")}
          </Span>
        </Link>
        <Link href="/dashboard" className="nav-link-underline">
          <Span
            variant="sm"
            className="text-lg tracking-[0.2em] text-ink font-semibold"
          >
            {t("nav.dashboard")}
          </Span>
        </Link>
      </nav>

      {/* Mobile/Tablet Menu Drawer */}
      <div
        className={`lg:hidden fixed top-20 left-0 right-0 bg-concrete border-b border-ink/5 z-40 transition-all duration-300 ${
          mobileMenuOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col p-6 gap-6">
          {/* Mobile Navigation Links */}
          <nav className="flex flex-col gap-4 border-b border-ink/10 pb-6">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-2">
              <Span variant="sm" className="text-xl tracking-[0.2em] text-ink">
                {t("nav.home")}
              </Span>
            </Link>
            <Link href="/stamp" onClick={() => setMobileMenuOpen(false)} className="py-2">
              <Span variant="sm" className="text-xl tracking-[0.2em] text-ink">
                {t("nav.stamp")}
              </Span>
            </Link>
            <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="py-2">
              <Span variant="sm" className="text-xl tracking-[0.2em] text-ink">
                {t("nav.orders")}
              </Span>
            </Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-2">
              <Span variant="sm" className="text-xl tracking-[0.2em] text-ink">
                {t("nav.dashboard")}
              </Span>
            </Link>
          </nav>

          {/* Mobile Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              asChild
              variant="outline"
              className="justify-center gap-3 border-brandCyan/20 p-4 rounded-xl bg-brandCyan/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/cart">
                <ShoppingBag className="w-5 h-5 text-brandCyan" />
                <Span variant="label" className="text-sm text-brandCyan">
                  {t("cart")}
                </Span>
              </Link>
            </Button>

            {user ? (
              <Button
                asChild
                variant="outline"
                className="justify-center gap-3 border-purple/20 p-4 rounded-xl bg-purple/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/profile">
                  <User className="w-5 h-5 text-purple" />
                  <Span variant="label" className="text-sm text-purple">
                    {t("account")}
                  </Span>
                </Link>
              </Button>
            ) : (
              <Login className="w-full flex items-center justify-center gap-3 border border-purple/20 p-4 rounded-xl bg-purple/5">
                <User className="w-5 h-5 text-purple" />
                <Span variant="label" className="text-sm text-purple">
                  {t("login")}
                </Span>
              </Login>
            )}

            {user && (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="justify-center gap-3 border-orange/20 p-4 rounded-xl bg-orange/5"
              >
                <LogOut className="w-5 h-5 text-orange" />
                <Span variant="label" className="text-sm text-orange">
                  {t("logout")}
                </Span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
