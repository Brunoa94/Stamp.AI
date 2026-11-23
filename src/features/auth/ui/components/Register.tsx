"use client";

import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import { AuthDialogForms } from "../../components/AuthDialogForms";
import { AuthDialog } from "../../components/AuthDialog";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

interface RegisterProps {
  className?: string;
  children?: ReactNode;
}

export function Register({ className, children }: RegisterProps) {
  const t = useTranslations("auth.register");

  return (
    <AuthDialog
      form={<AuthDialogForms initialView="register" />}
      className={className}
      defaultTrigger={
        <Button variant="secondary-compact" className={className}>
          <UserPlus aria-hidden className="size-4" />
          <Span unstyled>{t("register")}</Span>
        </Button>
      }
    >
      {children}
    </AuthDialog>
  );
}
