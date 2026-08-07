"use client";

import { ReactNode } from "react";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";

/**
 * AuthDialog
 *
 * Shared dialog shell for the auth flows: renders the trigger (custom
 * children or the caller's default button) and opens the given form.
 * Login and Register compose this instead of each recreating the
 * Dialog + DialogTrigger wiring.
 */

interface PropsI {
  /** Dialog content (e.g. <LoginForm />, <RegisterForm />). */
  form: ReactNode;
  /** Accessible label for the trigger. */
  triggerAriaLabel: string;
  /** Fallback trigger when no children are given. */
  defaultTrigger: ReactNode;
  /** Custom trigger content (wrapped in a plain button). */
  children?: ReactNode;
  className?: string;
}

export function AuthDialog({
  form,
  triggerAriaLabel,
  defaultTrigger,
  children,
  className,
}: PropsI) {
  return (
    <Dialog>
      <DialogTrigger asChild suppressHydrationWarning>
        {children ? (
          <button aria-label={triggerAriaLabel} className={className}>
            {children}
          </button>
        ) : (
          defaultTrigger
        )}
      </DialogTrigger>
      {form}
    </Dialog>
  );
}
