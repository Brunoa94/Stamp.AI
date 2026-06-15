"use client";

import { DialogClose } from "@/features/ui/dialog";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";
import { RegisterForm } from "../../register/RegisterForm";

export function LoginSignupFooter() {
  return (
    <div className="mt-12 text-center">
      <div className="mb-8 h-px w-full bg-ink/5" />
      <p className="text-xs font-medium text-ink/40">
        Don&apos;t have an account?{" "}
        <Dialog>
          <DialogClose asChild>
            <DialogTrigger asChild>
              <Button variant="link" className="h-auto p-0 font-bold text-purple-600 hover:underline ml-1">
                Create one now
              </Button>
            </DialogTrigger>
          </DialogClose>
          <RegisterForm />
        </Dialog>
      </p>
    </div>
  );
}
