"use client";

import { LogIn } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";

interface LoginProps {
  className?: string;
}

export function Login({ className }: LoginProps) {
  return (
    <Dialog>
      <DialogTrigger asChild suppressHydrationWarning>
        <Button
          variant="outline"
          aria-label="Open login dialog"
          className={className}
        >
          <LogIn className="mr-2 h-3 w-3" />
          <span className="uppercase">Login</span>
        </Button>
      </DialogTrigger>
      <LoginForm />
    </Dialog>
  );
}
