"use client";

import { DialogClose } from "@/features/ui/dialog";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";
import { LoginForm } from "../../login/LoginForm";

export function RegisterLoginFooter() {
  return (
    <div className="mt-12 text-center">
      <div className="mb-8 h-px w-full bg-(--color-stamp-divider)" />
      <p className="text-lg font-bold uppercase tracking-widest text-(--color-stamp-taupe)">
        Already have an account?{" "}
        <Dialog>
          <DialogClose asChild>
            <DialogTrigger asChild>
              <Button
                variant="link"
                className="h-auto p-0 font-bold text-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) hover:underline ml-1"
              >
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
