"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@/shared/queries/authQueries";
import { isRegisteredUser } from "@/shared/helpers/authIdentity";
import { useScrolled } from "@/shared/hooks/useScrolled";
import { getStampNavItems } from "@/features/stamp/lib/helpers/stampNavHelpers";
import { stampHeaderShellVariants } from "@/features/stamp/lib/variants/stampNavVariants";
import { StampHeaderLogo } from "./StampHeaderLogo";
import { StampDesktopNav } from "./StampDesktopNav";
import { StampDesktopAccount } from "./StampDesktopAccount";
import { StampCartLink } from "./StampCartLink";
import { StampHeaderCta } from "./StampHeaderCta";
import { StampMenuToggle } from "./StampMenuToggle";
import { StampMobileMenu } from "./StampMobileMenu";

/**
 * StampHeader
 *
 * Global header: a floating pill that sits transparent over the hero and
 * turns into a frosted capsule on scroll. Logo left, route links centred,
 * bag / account / "Stamp it!" right. Below `lg` the links, account and CTA
 * move into a floating menu card.
 *
 * The fixed slot stays `h-24` because pages offset their content by it.
 */
export function StampHeader() {
  const pathname = usePathname();
  const { data: user } = useUser();
  // Guests with an anonymous session see the logged-out header.
  const isRegistered = isRegisteredUser(user);
  const navItems = getStampNavItems(isRegistered);
  const isScrolled = useScrolled(24);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuId = useId();
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Focus inside the menu would be lost once it hides; hand it back to the toggle
      const focusInMenu = document
        .getElementById(mobileMenuId)
        ?.contains(document.activeElement);
      setMobileMenuOpen(false);
      if (focusInMenu) menuToggleRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen, mobileMenuId]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-24 items-center px-4 lg:px-8">
        <div
          className={stampHeaderShellVariants({
            elevated: isScrolled || mobileMenuOpen,
          })}
        >
          <div className="flex flex-1 items-center">
            <StampHeaderLogo onNavigate={closeMobileMenu} />
          </div>

          <StampDesktopNav items={navItems} pathname={pathname} />

          <div className="flex flex-1 items-center justify-end gap-1">
            <div className="hidden items-center gap-1 lg:flex">
              <StampDesktopAccount isRegistered={isRegistered} />
            </div>
            <StampCartLink onNavigate={closeMobileMenu} />
            <StampHeaderCta
              className="ml-2 hidden lg:inline-flex"
              onNavigate={closeMobileMenu}
            />
            <StampMenuToggle
              open={mobileMenuOpen}
              controlsId={mobileMenuId}
              buttonRef={menuToggleRef}
              onToggle={() => setMobileMenuOpen((open) => !open)}
            />
          </div>
        </div>
      </header>

      <StampMobileMenu
        id={mobileMenuId}
        open={mobileMenuOpen}
        items={navItems}
        pathname={pathname}
        isRegistered={isRegistered}
        onNavigate={closeMobileMenu}
      />
    </>
  );
}
