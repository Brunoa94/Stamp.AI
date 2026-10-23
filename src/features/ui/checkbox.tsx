"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Variants:
 * - default   Small rounded form checkbox — 16px
 * - stamp     Square brutalist selection box (cart rows, select-all) — 24px,
 *             gold fill when checked or indeterminate
 */

const checkboxVariants = {
  default:
    "h-4 w-4 rounded-sm border border-slate-300 ring-offset-white focus-visible:ring-purple-500 focus-visible:ring-offset-2 data-[state=checked]:bg-purple-600 data-[state=checked]:text-white data-[state=checked]:border-purple-600",
  stamp:
    "size-6 border-2 border-(--color-stamp-taupe) bg-(--color-stamp-white) text-(--color-stamp-white) duration-200 hover:border-(--color-stamp-gold) focus-visible:ring-(--color-stamp-gold)/40 data-[state=checked]:border-(--color-stamp-gold) data-[state=checked]:bg-(--color-stamp-gold) data-[state=indeterminate]:border-(--color-stamp-gold) data-[state=indeterminate]:bg-(--color-stamp-gold)",
} as const;

const indicatorIconVariants = {
  default: "h-3 w-3",
  stamp: "size-4",
} as const;

type CheckboxVariant = keyof typeof checkboxVariants;

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    variant?: CheckboxVariant;
  }
>(({ className, variant = "default", ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer group shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
      checkboxVariants[variant],
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check
        strokeWidth={variant === "stamp" ? 3 : 2}
        className={cn(indicatorIconVariants[variant], "group-data-[state=indeterminate]:hidden")}
      />
      <Minus
        strokeWidth={variant === "stamp" ? 3 : 2}
        className={cn(indicatorIconVariants[variant], "hidden group-data-[state=indeterminate]:block")}
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
