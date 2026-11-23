"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { useUser, useLogout } from "@/shared/queries/authQueries";
import { isRegisteredUser } from "@/shared/helpers/authIdentity";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";
import { LayoutGrid, Menu, ShoppingCart, X } from "lucide-react";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import { StampNavIconLink } from "./StampNavIconLink";
import { StampHeaderPromptBar } from "./StampHeaderPromptBar";
import { StampHeaderCategoryNav } from "./StampHeaderCategoryNav";
import { StampHeaderMobileDrawer } from "./StampHeaderMobileDrawer";
import { StampHeaderAccountIcons } from "./StampHeaderAccountIcons";
import { StampHeaderSignInIcon } from "./StampHeaderSignInIcon";

/**
 * StampHeader
 *
 * Fixed, marketplace-style header, h-24 in total so pages keep their offset.
 * Top row: logo and wordmark, the "describe your idea" bar centre stage
 * (where a marketplace has its search), then icon buttons with tooltips:
 * catalog, account, language and the bag. Second row: the category links,
 * centred, from `md`, or the prompt bar full width on phones. Below `lg` the
 * catalog, account and language move into a drawer.
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
        <div className="mx-auto flex h-15 w-full max-w-screen-2xl items-center gap-3 pt-1.5 lg:gap-6">
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

          <StampHeaderPromptBar className="mx-auto hidden max-w-3xl md:flex" />

          <nav
            className="hidden shrink-0 items-center gap-1 lg:flex"
            aria-label={t("mainNavAria")}
          >
            <StampNavIconLink href="/catalog" icon={LayoutGrid} label={t("catalog")} iconOnly />

            {isRegistered ? (
              <StampHeaderAccountIcons
                isLoggingOut={logoutMutation.isPending}
                onLogout={handleLogout}
              />
            ) : (
              <StampHeaderSignInIcon />
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

        <div className="mx-auto flex h-9 w-full max-w-screen-2xl items-center justify-center pb-1">
          <StampHeaderPromptBar className="md:hidden" />
          <div className="hidden min-w-0 md:block">
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
