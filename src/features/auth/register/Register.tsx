"use client";

import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import { RegisterForm } from "./RegisterForm";
import { AuthDialog } from "../components/AuthDialog";
import { Button } from "@/features/ui/button";

interface RegisterProps {
  className?: string;
  children?: ReactNode;
}

export function Register({ className, children }: RegisterProps) {
  const t = useTranslations("auth.register");

  return (
    <AuthDialog
      form={<RegisterForm />}
      triggerAriaLabel={t("openDialogAria")}
      className={className}
      defaultTrigger={
        <Button
          variant="outline"
          aria-label={t("openDialogAria")}
          className={className}
        >
          <UserPlus className="mr-2 h-3 w-3" />
          <span className="uppercase">{t("register")}</span>
        </Button>
      }
    >
      {children}
    </AuthDialog>
  );
}
