"use client";

import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Login } from "@/features/auth/ui/components/Login";
import { Register } from "@/features/auth/ui/components/Register";
import { useLogout } from "@/shared/queries/authQueries";
import {
  stampNavAuthLinkVariants,
  stampNavIconButtonVariants,
} from "@/features/stamp/lib/variants/stampNavVariants";

interface PropsI {
  isRegistered: boolean;
}

/**
 * Desktop account controls: profile and logout icons when signed in, quiet
 * "Sign in" / "Sign up" links otherwise.
 */
export function StampDesktopAccount({ isRegistered }: PropsI) {
  const t = useTranslations("stamp.header");
  const logoutMutation = useLogout();

  if (!isRegistered) {
    return (
      <>
        <Login className={stampNavAuthLinkVariants()}>{t("signIn")}</Login>
        <Register className={stampNavAuthLinkVariants()}>{t("signUp")}</Register>
      </>
    );
  }

  return (
    <>
      <Link
        href="/profile"
        aria-label={t("profileAria")}
        title={t("profile")}
        className={stampNavIconButtonVariants()}
      >
        <UserRound className="size-5" strokeWidth={1.75} aria-hidden />
      </Link>
      <Button
        variant="unstyled"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        aria-label={t("logoutAria")}
        title={t("logout")}
        className={stampNavIconButtonVariants()}
      >
        <LogOut className="size-5" strokeWidth={1.75} aria-hidden />
      </Button>
    </>
  );
}
