"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { PasswordResetRequestSkeleton } from "./PasswordResetRequestSkeleton";

const PasswordResetRequestForm = dynamic(() => import("./PasswordResetRequestForm").then(mod => ({ default: mod.PasswordResetRequestForm })), {
  loading: () => <PasswordResetRequestSkeleton />,
});

interface PasswordResetRequestProps {
  className?: string;
}

export function PasswordResetRequest({ className }: PasswordResetRequestProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className={`text-sm p-0 h-auto ${className}`}>
          Forgot password?
        </Button>
      </DialogTrigger>
      <PasswordResetRequestForm />
    </Dialog>
  );
}