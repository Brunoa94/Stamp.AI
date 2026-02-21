"use client";

import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/ui/dialog";
import { useLoginForm } from "./useLoginForm";
import dynamic from "next/dynamic";
import { Button } from "@/features/ui/button";
import { Form } from "@/features/ui/form";
import { FormField } from "@/features/ui/form-field";

const InlinePasswordReset = dynamic(
  () =>
    import("../passwordReset/InlinePasswordReset").then((mod) => ({
      default: mod.InlinePasswordReset,
    })),
  {
    ssr: false,
  },
);

export function LoginForm() {
  const { register, handleSubmit, onSubmit, isPending, errors } =
    useLoginForm();

  return (
    <DialogContent className="max-w-96">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-center">Login</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <FormField
            id="email"
            label="Email"
            type="email"
            required
            error={errors.email?.message}
            register={register("email")}
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            register={register("password")}
            error={errors?.password?.message}
          />

          {/* Inline password reset component */}
          <InlinePasswordReset />
        </div>

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
