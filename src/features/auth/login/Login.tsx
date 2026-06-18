"use client";

import { LogIn, User } from "lucide-react";
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
  return (
    <Dialog>
      <DialogTrigger asChild suppressHydrationWarning>
        {children ? (
          <button aria-label="Open login dialog" className={className}>
            {children}
          </button>
        ) : variant === "brutalist" ? (
          <button
            aria-label="Open login dialog"
            className={className}
          >
            <User className="w-5 h-5 text-purple group-hover:scale-110 transition-transform duration-300" />
            <span className="btn-text text-xs font-bold uppercase tracking-widest text-purple group-hover:text-white">
              LOGIN
            </span>
          </button>
        ) : (
          <Button
            variant="outline"
            aria-label="Open login dialog"
            className={className}
          >
            <LogIn className="mr-2 h-3 w-3" />
            <span className="uppercase">Login</span>
          </Button>
        )}
      </DialogTrigger>
      <LoginForm />
    </Dialog>
  );
}
