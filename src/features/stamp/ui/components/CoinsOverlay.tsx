"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Coins, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

interface CoinsOverlayProps {
  variant: "not-logged-in" | "no-coins";
  onSkip?: () => void;
}

/**
 * CoinsOverlay
 *
 * Displays an overlay when user cannot generate:
 * - "not-logged-in": User needs to authenticate
 * - "no-coins": User has exhausted daily coins (with skip option)
 *
 * Uses frosted glass effect following project design patterns.
 */
export function CoinsOverlay({ variant, onSkip }: CoinsOverlayProps) {
  const t = useTranslations("stamp.errors.coins");
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleRegister = () => {
    router.push("/auth/register");
  };

  if (variant === "not-logged-in") {
    return (
      <div
        className="absolute inset-0 z-10 flex items-center justify-center"
        data-testid="coins-overlay-login"
      >
        <div className="absolute inset-0 bg-(--color-stamp-cream)/80 backdrop-blur-md" />
        <div className="relative z-10 flex flex-col items-center gap-6 p-8 text-center max-w-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-stamp-chocolate)/10">
            <LogIn className="h-8 w-8 text-(--color-stamp-chocolate)" />
          </div>
          <div className="space-y-2">
            <Heading
              as="h3"
              variant="cardCompact"
              className="text-(--color-stamp-chocolate)"
            >
              {t("notLoggedIn")}
            </Heading>
            <Paragraph variant="xs" className="text-(--color-stamp-taupe)">
              {t("notLoggedInDescription")}
            </Paragraph>
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary-compact"
              onClick={handleLogin}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              {t("login")}
            </Button>
            <Button
              variant="secondary-compact"
              onClick={handleRegister}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {t("register")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // no-coins variant
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center"
      data-testid="coins-overlay-no-coins"
    >
      <div className="absolute inset-0 bg-(--color-stamp-cream)/80 backdrop-blur-md" />
      <div className="relative z-10 flex flex-col items-center gap-6 p-8 text-center max-w-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-stamp-gold)/20">
          <Coins className="h-8 w-8 text-(--color-stamp-gold)" />
        </div>
        <div className="space-y-2">
          <Heading
            as="h3"
            variant="cardCompact"
            className="text-(--color-stamp-chocolate)"
          >
            {t("noCoins")}
          </Heading>
          <Paragraph variant="xs" className="text-(--color-stamp-taupe)">
            {t("noCoinsDescription")}
          </Paragraph>
        </div>
        {onSkip && (
          <Button variant="primary-compact" onClick={onSkip} className="gap-2">
            {t("skipGeneration")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
