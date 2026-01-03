"use client";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/global/input/form";
import { useLoginForm } from "./useLoginForm";
import dynamic from "next/dynamic";

const InlinePasswordReset = dynamic(() => import("../passwordReset/InlinePasswordReset").then(mod => ({ default: mod.InlinePasswordReset })), {
  ssr: false,
});

export function LoginForm() {
  const { register, handleSubmit, onSubmit, isPending, errors } = useLoginForm();

  return (
    <DialogContent className="max-w-96">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-center">Login</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Form.InputText
            name="email"
            title="Email"
            register={register}
          />
          <Form.InputPassword
            name="password"
            title="Password"
            register={register}
          />

          {/* Inline password reset component */}
          <InlinePasswordReset />
        </div>

        {errors.root && (
          <p className="text-sm text-red-500">{errors.root.message}</p>
        )}

        <DialogFooter className="flex flex-col gap-2">
          <Button
            aria-label="Login"
            variant="default"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>
          <DialogClose asChild>
            <Button aria-label="Cancel" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}