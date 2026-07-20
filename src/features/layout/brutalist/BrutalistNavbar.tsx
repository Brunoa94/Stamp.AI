"use client";

import Link from "next/link";
import { ShoppingBag, LogIn, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { AnimatedLogoDot } from "./AnimatedLogoDot";
import { Span } from "@/features/ui/span";
import { List } from "@/features/ui/list";
import { Login } from "@/features/auth/login/Login";
import { useIsAuthenticated, useLogout } from "@/queries/authQueries";

/**
 * Brutalist Navbar Component
 *
 * Fixed header with three-column layout:
 * - Left: Logo with animated dot + subtitle
 * - Center: "STAMP IT" CTA with gradient border
 * - Right: Navigation menu + cart dropdown + login button
 */

const NAV_LINKS = [
  { id: "nav-home-link", href: "#" },
  { id: "nav-products-link", href: "#pricing" },
  { id: "nav-gallery-link", href: "#" },
  { id: "nav-about-link", href: "#about" },
];

const CART_ITEMS = [
  { id: "essential-box-tee" },
  { id: "archival-black-tee" },
  { id: "concrete-hoodie" },
];

export function BrutalistNavbar() {
  const t = useTranslations("layout.brutalistNavbar");
  const { isAuthenticated } = useIsAuthenticated();
  const logout = useLogout();

  return (
    <header className="brutalist-navbar fixed top-0 left-0 right-0 w-full z-40 px-6 py-2 flex items-center justify-between text-ink bg-concrete/80 backdrop-blur-sm transition-colors duration-300">
      {/* Left: Logo with animated dot */}
      <div className="flex-1 flex justify-start items-center">
        <Link
          href="/"
          id="header-logo-redesign"
          className="flex items-center font-heading text-xl md:text-2xl leading-none tracking-tighter uppercase hover:opacity-80 transition-opacity gap-1"
        >
          {t.rich("brand", {
            stamp: (chunks) => (
              <Span className="text-3xl" unstyled>
                {chunks}
              </Span>
            ),
            dot: () => <AnimatedLogoDot size="md" className="mx-2" />,
            ai: (chunks) => <Span unstyled>{chunks}</Span>,
          })}
        </Link>
      </div>

      {/* Center: "STAMP IT" CTA */}
      <div className="flex-1 flex justify-center items-center">
        <Button asChild variant="brutalist-primary">
          <Link href="/stamp" id="header-center-cta">
            {t("centerCta")}
          </Link>
        </Button>
      </div>

      {/* Right: Navigation + Cart + Login */}
      <div className="flex-1 flex justify-end items-center mr-0 md:mr-8 relative">
        {/* Navigation menu (desktop only, positioned below header) */}
        <nav className="hidden lg:block absolute top-full right-0 mt-4">
          <List className="flex flex-col items-end gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.id} className="overflow-hidden">
                <Link
                  href={link.href}
                  id={link.id}
                  className="nav-link uppercase text-[10px] font-bold tracking-widest font-heading hover:text-brandPurple transition-colors"
                >
                  {t(`navLinks.${link.id}`)}
                </Link>
              </li>
            ))}
          </List>
        </nav>

        <div className="flex items-center gap-3 md:gap-6">
          {/* Cart dropdown (desktop only XL) */}
          <div className="hidden xl:block relative group/cart">
            <Button variant="brutalist-ghost">
              <ShoppingBag className="w-4 h-4 text-ink" />
              <Span variant="default" className="tracking-widest">
                {t("cartLabel", { count: CART_ITEMS.length })}
              </Span>
            </Button>

            {/* Cart preview dropdown */}
            <div className="absolute top-full right-0 mt-4 w-80 bg-white border border-ink/10 p-6 shadow-[8px_8px_0px_rgba(10,10,10,0.05)] opacity-0 translate-y-2 pointer-events-none group-hover/cart:opacity-100 group-hover/cart:translate-y-0 group-hover/cart:pointer-events-auto transition-all duration-300 z-50">
              <div className="flex flex-col gap-3">
                {CART_ITEMS.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-1 hover:bg-concrete/30 p-2 -m-2 rounded transition-colors"
                  >
                    <Span className="font-heading text-sm uppercase tracking-tight text-ink">
                      {t(`cartItems.${item.id}.name`)}
                    </Span>
                    <Span
                      variant="micro"
                      className="opacity-60 tracking-widest text-ink"
                    >
                      {t(`cartItems.${item.id}.details`)}
                    </Span>
                  </div>
                ))}
              </div>

              <div className="border-t border-ink/10 pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <Span
                    variant="default"
                    className="opacity-40 tracking-widest"
                  >
                    {t("subtotal")}
                  </Span>
                  <Span className="text-[10px] font-heading text-ink tracking-normal">
                    {t("total")}
                  </Span>
                </div>
                <Button asChild variant="brutalist-danger">
                  <Link href="/cart" id="header-cart-preview-link">
                    <ShoppingBag className="w-3 h-3" />
                    {t("viewFullCart")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Login button or user section */}
          {!isAuthenticated ? (
            <Login className="h-auto rounded-none border border-ink/20 px-3 md:px-4 py-1.5 font-bold text-[9px] tracking-widest uppercase hover:text-brandRed hover:border-brandRed transition-all duration-300 whitespace-nowrap font-heading" />
          ) : (
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="h-auto rounded-none border border-ink/20 px-3 md:px-4 py-1.5 font-bold text-[9px] tracking-widest uppercase hover:text-brandRed hover:border-brandRed transition-all duration-300 whitespace-nowrap font-heading"
              >
                <Link href="/account" id="nav-account-btn-header">
                  {t("account")}
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => logout.mutate()}
                className="h-auto rounded-none border border-ink/20 px-3 md:px-4 py-1.5 font-bold text-[9px] tracking-widest uppercase hover:text-brandRed hover:border-brandRed transition-all duration-300 whitespace-nowrap font-heading"
              >
                <LogOut className="mr-2 h-3 w-3" />
                <span className="uppercase">{t("logout")}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
