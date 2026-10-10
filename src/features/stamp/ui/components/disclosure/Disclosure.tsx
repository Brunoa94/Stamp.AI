"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";

/**
 * Disclosure
 *
 * Stamp-styled collapsible group: a bordered trigger row with an uppercase
 * label, an optional current-value summary, and a rotating chevron. Used to
 * keep step sections inside the viewport by folding secondary controls.
 * Uncontrolled by default; pass `open`/`onOpenChange` to control it.
 */

interface PropsI {
  label: string;
  /** Short summary of the current selection, shown next to the chevron. */
  value?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export function Disclosure({
  label,
  value,
  defaultOpen = false,
  open,
  onOpenChange,
  className,
  contentClassName,
  children,
}: PropsI) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const contentId = useId();

  const toggle = () => {
    const next = !isOpen;
    setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div
      className={cn(
        "border border-(--color-stamp-divider) bg-white",
        className,
      )}
    >
      <Button
        type="button"
        variant="stamp-disclosure"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <Span
          variant="micro"
          className="tracking-widest text-(--color-stamp-taupe)"
        >
          {label}
        </Span>
        <span className="flex min-w-0 items-center gap-2">
          {value && (
            <Span
              variant="micro"
              className="truncate font-bold tracking-widest text-(--color-stamp-chocolate)"
            >
              {value}
            </Span>
          )}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "h-4 w-4 shrink-0 text-(--color-stamp-taupe) transition-transform duration-300",
              isOpen && "rotate-180",
            )}
          />
        </span>
      </Button>
      {isOpen && (
        <div
          id={contentId}
          className={cn(
            "border-t border-(--color-stamp-divider) p-4",
            contentClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
