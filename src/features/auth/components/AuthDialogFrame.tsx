"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { DialogClose, DialogContent, DialogTitle } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";

/**
 * AuthDialogFrame
 *
 * Shared surface for the Login and Sign Up dialogs: a white rounded-xl card
 * with the chocolate brand panel on the left and the form on the right,
 * a divider border and the stamp modal shadow. The form opens with the
 * amber accent bar, ahead of the dialog header's eyebrow and title. Below `md`
 * the panel is hidden and the form takes the full width. The form column
 * scrolls on its own so tall forms never push the dialog off screen.
 */

interface PropsI {
  srTitle: string;
  closeAria: string;
  /** Brand side of the dialog, usually an <AuthBrandPanel />. */
  panel: ReactNode;
  children: ReactNode;
}

export function AuthDialogFrame({ srTitle, closeAria, panel, children }: PropsI) {
  return (
    <DialogContent
      showCloseButton={false}
      className="max-w-[calc(100%-2rem)] gap-0 rounded-xl border-none bg-transparent p-0 shadow-none sm:max-w-xl md:max-w-5xl"
    >
      <DialogTitle className="sr-only">{srTitle}</DialogTitle>

      <div className="relative grid overflow-hidden rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) shadow-(--shadow-stamp-modal) md:grid-cols-12">
        {/* Outside the scrolling column so it stays in view on tall forms */}
        <DialogClose asChild>
          <Button
            type="button"
            variant="stamp-close"
            size="icon"
            aria-label={closeAria}
            className="absolute top-6 right-6 z-20"
          >
            <X aria-hidden className="size-5" />
          </Button>
        </DialogClose>

        <div className="md:col-span-5">{panel}</div>

        <div className="relative max-h-[calc(100dvh-3rem)] overflow-y-auto md:col-span-7">
          <div className="px-6 pt-12 pb-10 sm:px-10 lg:px-14 lg:pt-14 lg:pb-12">
            <div aria-hidden className="mb-6 h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
            {children}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
