"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

/**
 * Variants:
 * - default   Form field labels — sm, semibold, sentence case, chocolate
 * - section   Uppercase eyebrow above option groups — xs, bold, tracking-widest
 *             (pair with --color-stamp-gold-text or --color-stamp-taupe)
 * - option    Title inside a selectable option card — base, semibold, chocolate
 */

const labelVariants = {
  default:
    "flex items-center gap-1 text-sm leading-none font-semibold text-(--color-stamp-chocolate)",
  section: "block text-xs leading-none font-bold uppercase tracking-widest",
  option:
    "flex items-center gap-2 text-base leading-tight font-semibold text-(--color-stamp-chocolate)",
} as const;

type LabelVariant = keyof typeof labelVariants;

function Label({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  variant?: LabelVariant;
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        labelVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Label };
