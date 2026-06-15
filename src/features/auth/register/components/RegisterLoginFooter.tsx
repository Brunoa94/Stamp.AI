"use client";

import { DialogClose } from "@/features/ui/dialog";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";
import { LoginForm } from "../../login/LoginForm";

export function RegisterLoginFooter() {
  return (
    <div className="mt-12 text-center">
      <div className="mb-8 h-px w-full bg-ink/5" />
      <p className="text-xs font-medium text-ink/40">
        Already have an account?{" "}
        <Dialog>
          <DialogClose asChild>
            <DialogTrigger asChild>
              <Button variant="link" className="h-auto p-0 font-bold text-purple-600 hover:underline ml-1">
                Log in
              </Button>
            </DialogTrigger>
          </DialogClose>
          <LoginForm />
        </Dialog>
      </p>
    </div>
  );
}
