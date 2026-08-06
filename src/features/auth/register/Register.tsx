"use client";

import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { RegisterForm } from "./RegisterForm";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";
import { ReactNode } from "react";

interface RegisterProps {
  className?: string;
  children?: ReactNode;
}

export function Register({ className, children }: RegisterProps) {
  const t = useTranslations("auth.register");

  return (
    <Dialog>
      <DialogTrigger asChild suppressHydrationWarning>
        {children ? (
          <button aria-label={t("openDialogAria")} className={className}>
            {children}
          </button>
        ) : (
          <Button
            variant="outline"
            aria-label={t("openDialogAria")}
            className={className}
          >
            <UserPlus className="mr-2 h-3 w-3" />
            <span className="uppercase">{t("register")}</span>
          </Button>
        )}
      </DialogTrigger>
      <RegisterForm />
    </Dialog>
  );
}
