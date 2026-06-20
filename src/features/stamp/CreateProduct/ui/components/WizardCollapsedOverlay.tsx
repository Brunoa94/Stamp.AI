"use client";

import clsx from "clsx";
import { Button } from "@/features/ui/button";

interface WizardCollapsedOverlayProps {
  isExpanded: boolean;
  onExpand: () => void;
}

export function WizardCollapsedOverlay({
  isExpanded,
  onExpand,
}: WizardCollapsedOverlayProps) {
  return (
    <div
      className={clsx(
        "absolute inset-0 z-40 bg-linear-to-br from-white/92 via-white/88 to-white/84 backdrop-blur-xs transition-all duration-700 ease-in-out",
        isExpanded
          ? "opacity-0 translate-y-full pointer-events-none"
          : "opacity-100 translate-y-0 pointer-events-auto",
      )}
      aria-hidden={isExpanded}
      onClick={onExpand}
    >
      <div className="absolute inset-y-0 right-0 w-2/5 bg-linear-to-br from-[#7C3AED]/8 to-[#06B6D4]/10" />

      <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 max-w-sm">
        <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 uppercase leading-tight">
          Ready to stamp your signature?
        </h3>
      </div>

      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2">
        <Button
          type="button"
          data-testid="wizard-expand-cta"
          onClick={(event) => {
            event.stopPropagation();
            onExpand();
          }}
          className="h-14 px-10 rounded-full bg-linear-to-r from-[#7C3AED] to-[#06B6D4] hover:brightness-110 text-white text-base md:text-lg font-heading font-bold uppercase tracking-wider shadow-[0_8px_24px_rgba(124,58,237,0.35)] animate-pulse"
        >
          Upload your photo
        </Button>
      </div>
    </div>
  );
}
