"use client";

import { useTranslations } from "next-intl";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Login } from "@/features/auth/login/Login";
import { Register } from "@/features/auth/register/Register";
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
            <span>
              <LogIn className="h-4 w-4" />
              {t("login")}
            </span>
          </Button>
        </Login>
        <Register>
          <Button variant="secondary-compact" className="gap-2" asChild>
            <span>
              <UserPlus className="h-4 w-4" />
              {t("register")}
            </span>
          </Button>
        </Register>
      </div>
    </CoinsOverlayShell>
  );
}
