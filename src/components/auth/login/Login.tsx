"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { LogIn } from "lucide-react";
import { LoginForm } from "./LoginForm";

interface LoginProps {
  className?: string;
}

export function Login({ className }: LoginProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          aria-label="Open login dialog"
          className={className}
        >
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Button>
      </DialogTrigger>
      <LoginForm />
    </Dialog>
  );
}
