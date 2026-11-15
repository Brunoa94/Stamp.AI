"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { DialogClose, DialogContent, DialogTitle } from "@/features/ui/dialog";
import { Button } from "@/features/ui/button";

/**
 * AuthDialogFrame
 *
 * Shared luxury surface for the Login and Sign Up dialogs: a two-column card
 * with the chocolate brand panel on the left and the form on the right,
 * framed by an offset gold outline and the stamp modal shadow. Below `md`
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
      className="max-w-[calc(100%-2rem)] gap-0 rounded-none border-none bg-transparent p-0 shadow-none sm:max-w-xl md:max-w-5xl"
    >
      <DialogTitle className="sr-only">{srTitle}</DialogTitle>

      {/* Offset gold frame behind the card */}
      <div
        className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-(--color-stamp-gold)/60"
        aria-hidden="true"
      />

      <div className="relative grid overflow-hidden border-2 border-(--color-stamp-chocolate)/15 bg-(--color-stamp-white) shadow-(--shadow-stamp-modal) md:grid-cols-12">
        {/* Outside the scrolling column so it stays in view on tall forms */}
        <DialogClose asChild>
          <Button
            type="button"
            variant="stamp-close"
            size="icon"
            aria-label={closeAria}
            className="absolute top-8 right-8 z-20"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogClose>

        <div className="md:col-span-5">{panel}</div>

        <div className="relative max-h-[calc(100dvh-3rem)] overflow-y-auto md:col-span-7">
          {/* Gold accent rule */}
          <div className="h-1.5 w-full bg-(--color-stamp-gold)" aria-hidden="true" />

          <div className="px-6 pt-12 pb-10 sm:px-10 lg:px-14 lg:pt-14 lg:pb-12">
            {children}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
