"use client";

import { UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Login } from "@/features/auth/ui/components/Login";
import { Span } from "@/features/ui/span";
import {
  stampNavIconLinkVariants,
  stampNavIconVariants,
  stampNavTooltipVariants,
} from "@/features/stamp/lib/variants/stampNavVariants";

/**
 * StampHeaderSignInIcon
 *
 * The guest's account icon in the desktop header: opens the sign-in dialog,
 * which also leads to sign-up. Its name, "Sign in", is visually hidden text,
 * and the same words appear as a tooltip on hover and keyboard focus.
 */
export function StampHeaderSignInIcon() {
  const t = useTranslations("stamp.header");

  return (
    <Login className={stampNavIconLinkVariants({ iconOnly: true })}>
      <UserRound className={stampNavIconVariants()} strokeWidth={1.75} aria-hidden />
      <Span unstyled className="sr-only">
        {t("signIn")}
      </Span>
      <Span unstyled aria-hidden className={stampNavTooltipVariants()}>
        {t("signIn")}
      </Span>
    </Login>
  );
}
