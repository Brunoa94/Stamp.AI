"use client";

import { LogIn, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { LoginForm } from "./LoginForm";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";
import { ReactNode } from "react";

interface LoginProps {
  className?: string;
  children?: ReactNode;
  variant?: "default" | "brutalist";
}

export function Login({ className, children, variant = "default" }: LoginProps) {
  const t = useTranslations("auth.login");

  return (
    <Dialog>
      <DialogTrigger asChild suppressHydrationWarning>
        {children ? (
          <button aria-label={t("openDialogAria")} className={className}>
            {children}
          </button>
        ) : variant === "brutalist" ? (
          <button
            aria-label={t("openDialogAria")}
            className={className}
          >
            <User className="w-5 h-5 text-purple group-hover:scale-110 transition-transform duration-300" />
            <span className="btn-text text-xs font-bold uppercase tracking-widest text-purple group-hover:text-white">
              {t("loginShort")}
            </span>
          </button>
        ) : (
          <Button
            variant="outline"
            aria-label={t("openDialogAria")}
            className={className}
          >
            <LogIn className="mr-2 h-3 w-3" />
            <span className="uppercase">{t("login")}</span>
          </Button>
        )}
      </DialogTrigger>
      <LoginForm />
    </Dialog>
  );
}
