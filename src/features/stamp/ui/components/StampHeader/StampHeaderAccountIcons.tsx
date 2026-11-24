"use client";

import { LogOut, Package, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import {
  stampNavIconLinkVariants,
  stampNavIconVariants,
  stampNavTooltipVariants,
} from "@/features/stamp/lib/variants/stampNavVariants";
import { StampNavIconLink } from "./StampNavIconLink";

interface PropsI {
  isLoggingOut: boolean;
  onLogout: () => void;
}

/**
 * StampHeaderAccountIcons
 *
 * A signed-in visitor's account icons in the desktop header: orders, profile
 * and log out, each with a tooltip on hover and keyboard focus.
 */
export function StampHeaderAccountIcons({ isLoggingOut, onLogout }: PropsI) {
  const t = useTranslations("stamp.header");

  return (
    <>
      <StampNavIconLink href="/orders" icon={Package} label={t("orders")} iconOnly />
      <StampNavIconLink href="/profile" icon={UserRound} label={t("profile")} iconOnly />
      <Button
        variant="unstyled"
        onClick={onLogout}
        disabled={isLoggingOut}
        aria-label={t("logoutAria")}
        className={stampNavIconLinkVariants({ iconOnly: true })}
      >
        <LogOut className={stampNavIconVariants()} strokeWidth={1.75} aria-hidden />
        <Span unstyled aria-hidden className={stampNavTooltipVariants()}>
          {t("logout")}
        </Span>
      </Button>
    </>
  );
}
