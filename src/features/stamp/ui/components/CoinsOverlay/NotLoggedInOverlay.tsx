"use client";

import { useTranslations } from "next-intl";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { Login } from "@/features/auth/ui/components/Login";
import { Register } from "@/features/auth/ui/components/Register";
import { CoinsOverlayShell } from "./CoinsOverlayShell";

/**
 * NotLoggedInOverlay
 *
 * Shown when an unauthenticated user tries to generate: prompts to log in
 * or register via the auth dialogs.
 */

export function NotLoggedInOverlay() {
  const t = useTranslations("stamp.errors.coins");

  return (
    <CoinsOverlayShell
      testId="coins-overlay-login"
      icon={<LogIn className="h-8 w-8 text-(--color-stamp-chocolate)" />}
      iconClassName="bg-(--color-stamp-chocolate)/10"
      title={t("notLoggedIn")}
      description={t("notLoggedInDescription")}
    >
      <div className="flex gap-3">
        <Login>
          <Button variant="primary-compact" className="gap-2" asChild>
            <Span unstyled>
              <LogIn className="h-4 w-4" />
              {t("login")}
            </Span>
          </Button>
        </Login>
        <Register>
          <Button variant="secondary-compact" className="gap-2" asChild>
            <Span unstyled>
              <UserPlus className="h-4 w-4" />
              {t("register")}
            </Span>
          </Button>
        </Register>
      </div>
    </CoinsOverlayShell>
  );
}
