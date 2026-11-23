"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { Login } from "@/features/auth/ui/components/Login";
import { Register } from "@/features/auth/ui/components/Register";
import { useUser, useLogout } from "@/shared/queries/authQueries";
import { isRegisteredUser } from "@/shared/helpers/authIdentity";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";
import { LayoutGrid, Menu, Package, ShoppingCart, UserRound, X } from "lucide-react";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import { cn } from "@/lib/utils";
import {
  stampNavLinkVariants,
  stampNavSignUpVariants,
} from "@/features/stamp/lib/variants/stampNavVariants";
import { StampNavIconLink } from "./StampNavIconLink";
import { StampHeaderPromptBar } from "./StampHeaderPromptBar";
import { StampHeaderCategoryNav } from "./StampHeaderCategoryNav";
import { StampHeaderMobileDrawer } from "./StampHeaderMobileDrawer";

/**
 * StampHeader
 *
 * Fixed, marketplace-style header, h-24 in total so pages keep their offset.
 * Top row: logo and wordmark, catalog pill, the "describe your idea" prompt
 * bar (where a marketplace has its search), account actions and the bag.
 * Second row: category links from `md`, or the prompt bar full width on
 * phones. Below `lg` the account actions move into a drawer.
 */

export function StampHeader() {
  const t = useTranslations("stamp.header");
  const { data: user } = useUser();
  // Guests with an anonymous session see the logged-out header.
  const isRegistered = isRegisteredUser(user);
  const logoutMutation = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Any navigation closes the drawer, including links in the header row
  // above it (logo, prompt bar, bag). Adjusted during render rather than in
  // an effect, so the closed drawer never paints over the new page.
  const pathname = usePathname();
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Escape closes the drawer and hands focus back to the menu button
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* The gutter sits on the header and the rows are max-w-screen-2xl
          inside it, exactly like page sections, so edges line up */}
      <header className="fixed top-0 right-0 left-0 z-50 flex h-24 flex-col border-b border-(--color-stamp-divider) bg-(--color-stamp-off-white) px-4 sm:px-6 lg:px-12">
        <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center gap-3 pt-2 lg:gap-5">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-stamp-chocolate)"
            aria-label={t("logoAria")}
          >
            <Image
              src={staticAssetUrl("/logo.png")}
              alt=""
              width={40}
              height={40}
              className="size-9 rounded-lg object-contain"
              priority
            />
            <Span unstyled aria-hidden className="flex items-baseline">
              <Span unstyled className="font-heading text-3xl leading-none text-(--color-stamp-chocolate)">
                {t("wordmark")}
              </Span>
              <Span unstyled className="font-serif text-2xl leading-none text-(--color-stamp-gold-text)">
                .ai
              </Span>
            </Span>
          </Link>

          <StampNavIconLink href="/catalog" icon={LayoutGrid} label={t("catalog")} compact className="hidden lg:inline-flex" />

          <StampHeaderPromptBar className="hidden md:flex" />

          <nav
            className="ml-auto hidden shrink-0 items-center gap-1 lg:flex xl:gap-2"
            aria-label={t("mainNavAria")}
          >
            {isRegistered && (
              <StampNavIconLink href="/orders" icon={Package} label={t("orders")} compact />
            )}

            {isRegistered && (
              <StampNavIconLink href="/profile" icon={UserRound} label={t("profile")} iconOnly />
            )}

            {isRegistered ? (
              <Button
                variant="unstyled"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className={cn(stampNavLinkVariants(), "px-3 py-2")}
                aria-label={t("logoutAria")}
              >
                {t("logout")}
              </Button>
            ) : (
              <>
                <Login className={cn(stampNavLinkVariants(), "px-3 py-2")}>{t("signIn")}</Login>
                <Register className={stampNavSignUpVariants()}>
                  {t("signUp")}
                </Register>
              </>
            )}

            <LanguageSwitcher />
          </nav>

          <StampNavIconLink
            href="/cart"
            icon={ShoppingCart}
            iconSize="lg"
            label={t("cart")}
            iconOnly
            className="ml-auto md:ml-0"
          />

          <Button
            ref={menuButtonRef}
            variant="unstyled"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="-mr-2 flex size-11 flex-none items-center justify-center rounded-lg text-(--color-stamp-chocolate) hover:bg-(--color-stamp-cream) focus-visible:ring-2 focus-visible:ring-(--color-stamp-chocolate) lg:hidden"
            aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </Button>
        </div>

        <div className="mx-auto flex h-10 w-full max-w-screen-2xl items-center pb-1">
          <StampHeaderPromptBar className="h-9 md:hidden" />
          {/* -ml-3 cancels the links' own padding so the first label lines up */}
          <div className="-ml-3 hidden min-w-0 md:block">
            <StampHeaderCategoryNav />
          </div>
        </div>
      </header>

      <StampHeaderMobileDrawer
        open={mobileMenuOpen}
        isRegistered={isRegistered}
        isLoggingOut={logoutMutation.isPending}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}
