"use client";

import { Fragment, ReactNode, useState, useEffect, useRef } from "react";
import { Button } from "@/features/ui/button";
import { Dialog, DialogTrigger } from "@/features/ui/dialog";
import { useUser } from "@/shared/queries/authQueries";
import { isRegisteredUser } from "@/shared/helpers/authIdentity";

/**
 * AuthDialog
 *
 * Shared dialog shell for the auth flows: renders the trigger (custom
 * children or the caller's default button) and opens the given form.
 * Login and Register compose this instead of each recreating the
 * Dialog + DialogTrigger wiring.
 *
 * Auto-closes when authentication state changes (user logs in). The form
 * remounts on every open, so it starts on its first view again after the
 * user switched between Login and Sign Up and closed the dialog.
 */

interface PropsI {
  /** Dialog content (e.g. <LoginForm />, <RegisterForm />). */
  form: ReactNode;
  /** Fallback trigger when no children are given. */
  defaultTrigger: ReactNode;
  /** Custom trigger content (wrapped in a plain button). */
  children?: ReactNode;
  className?: string;
}

export function AuthDialog({
  form,
  defaultTrigger,
  children,
  className,
}: PropsI) {
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const { data: user } = useUser();
  const isRegistered = isRegisteredUser(user);
  const wasOpenRef = useRef(false);

  // Auto-close dialog when the user logs in. A guest's anonymous session
  // does not count, so the dialog stays open for them.
  useEffect(() => {
    if (wasOpenRef.current && isRegistered) {
      setOpen(false);
    }
    wasOpenRef.current = open;
  }, [isRegistered, open]);

  const handleOpenChange = (next: boolean) => {
    if (next) setOpenCount((count) => count + 1);
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild suppressHydrationWarning>
        {children ? (
          // Uses unstyled variant for triggers whose appearance is fully
          // caller-owned (nav links, overlay CTAs that pass a styled element).
          // Their visible text is the accessible name (WCAG 2.5.3).
          <Button
            type="button"
            variant="unstyled"
            className={className}
          >
            {children}
          </Button>
        ) : (
          defaultTrigger
        )}
      </DialogTrigger>
      <Fragment key={openCount}>{form}</Fragment>
    </Dialog>
  );
}
