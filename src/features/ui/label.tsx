"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

/**
 * Variants:
 * - default   Form field labels — lg, medium weight
 * - section   Uppercase section headings above option groups — xs, bold, tracking-widest
 * - option    Title inside a selectable option card — sm, heading font, tracking-wider
 */

const labelVariants = {
  default: "flex items-center gap-2 text-lg leading-none font-medium",
  section: "block text-xs leading-none font-bold uppercase tracking-widest",
  option:
    "flex items-center gap-2 font-heading text-sm leading-none font-medium tracking-wider",
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
