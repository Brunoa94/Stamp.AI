"use client";

import { LogIn, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import { AuthDialogForms } from "../../components/AuthDialogForms";
import { AuthDialog } from "../../components/AuthDialog";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

interface LoginProps {
  className?: string;
  children?: ReactNode;
  variant?: "default" | "brutalist";
}

export function Login({ className, children, variant = "default" }: LoginProps) {
  const t = useTranslations("auth.login");

  const defaultTrigger =
    variant === "brutalist" ? (
      <Button variant="ghost-stamp" className={className}>
        <User aria-hidden className="size-5" />
        <Span unstyled>{t("loginShort")}</Span>
      </Button>
    ) : (
      <Button variant="secondary-compact" className={className}>
        <LogIn aria-hidden className="size-4" />
        <Span unstyled>{t("login")}</Span>
      </Button>
    );

  return (
    <AuthDialog
      form={<AuthDialogForms initialView="login" />}
      className={className}
      defaultTrigger={defaultTrigger}
    >
      {children}
    </AuthDialog>
  );
}
