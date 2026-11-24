"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Login } from "@/features/auth/ui/components/Login";
import { Register } from "@/features/auth/ui/components/Register";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { HEADER_CATEGORY_LINKS } from "@/features/stamp/lib/constants/headerCategoryLinks";
import {
  stampNavCategoryLinkVariants,
  stampNavLinkVariants,
  stampNavSignUpVariants,
} from "@/features/stamp/lib/variants/stampNavVariants";

interface PropsI {
  open: boolean;
  isRegistered: boolean;
  isLoggingOut: boolean;
  onClose: () => void;
  onLogout: () => void;
}

/**
 * StampHeaderMobileDrawer
 *
 * The header's menu below `lg`: catalog, bag and account pages first, then
 * every category link, then sign in/up and the language switcher. Open, it
 * fills the viewport under the header and scrolls on its own; closed, it is
 * `inert`, so its links leave the tab order and the accessibility tree.
 */
export function StampHeaderMobileDrawer({
  open,
  isRegistered,
  isLoggingOut,
  onClose,
  onLogout,
}: PropsI) {
  const t = useTranslations("stamp.header");

  return (
    <div
      // Closed, it stays mounted for the transition but leaves the tab order
      inert={!open}
      className={cn(
        "fixed top-24 right-0 left-0 z-40 overflow-y-auto overscroll-contain bg-(--color-stamp-off-white) transition-opacity duration-300 lg:hidden",
        open ? "bottom-0 opacity-100" : "max-h-0 overflow-hidden opacity-0",
      )}
    >
      <nav className="flex flex-col gap-1 p-6" aria-label={t("mobileNavAria")}>
        <Link href="/catalog" onClick={onClose} className={cn(stampNavLinkVariants(), "py-3")}>
          {t("catalog")}
        </Link>
        <Link href="/cart" onClick={onClose} className={cn(stampNavLinkVariants(), "py-3")}>
          {t("cart")}
        </Link>

        {isRegistered && (
          <>
            <Link href="/orders" onClick={onClose} className={cn(stampNavLinkVariants(), "py-3")}>
              {t("orders")}
            </Link>
            <Link href="/profile" onClick={onClose} className={cn(stampNavLinkVariants(), "py-3")}>
              {t("profile")}
            </Link>
          </>
        )}

        {HEADER_CATEGORY_LINKS.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            onClick={onClose}
            className={cn(stampNavCategoryLinkVariants(), "px-0 py-3 text-base")}
          >
            {t(`categories.${link.id}`)}
          </Link>
        ))}

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-(--color-stamp-divider) pt-5">
          {isRegistered ? (
            <Button
              variant="secondary-compact"
              onClick={onLogout}
              disabled={isLoggingOut}
              aria-label={t("logoutAria")}
            >
              {t("logout")}
            </Button>
          ) : (
            <>
              <Login className={cn(stampNavLinkVariants(), "px-1 py-2")}>{t("signIn")}</Login>
              <Register className={stampNavSignUpVariants()}>{t("signUp")}</Register>
            </>
          )}
          {open && <LanguageSwitcher className="ml-auto" />}
        </div>
      </nav>
    </div>
  );
}
