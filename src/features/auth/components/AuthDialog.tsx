"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";
import { useUser } from "@/queries/authQueries";

/**
 * AuthDialog
 *
 * Shared dialog shell for the auth flows: renders the trigger (custom
 * children or the caller's default button) and opens the given form.
 * Login and Register compose this instead of each recreating the
 * Dialog + DialogTrigger wiring.
 *
 * Auto-closes when authentication state changes (user logs in).
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
  const [open, setOpen] = useState(false);
  const { data: user } = useUser();
  const wasOpenRef = useRef(false);

  // Auto-close dialog when user becomes authenticated
  useEffect(() => {
    if (wasOpenRef.current && user) {
      setOpen(false);
    }
    wasOpenRef.current = open;
  }, [user, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild suppressHydrationWarning>
        {children ? (
          // Deliberately a plain button: this path exists for triggers whose
          // appearance is fully caller-owned (nav links, overlay CTAs that
          // pass a styled element). The design-system Button's base classes
          // would fight the caller's styling here.
          <button type="button" aria-label={triggerAriaLabel} className={className}>
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
