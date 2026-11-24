"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Variants:
 * - default   Form checkbox — 16px, rounded-sm
 * - stamp     Larger selection box (cart rows, select-all) — 24px, rounded-md
 *
 * Both share the stamp look: white box with a taupe border (chocolate on
 * hover), amber fill with a chocolate check when checked or indeterminate
 * (amber is fill only, chocolate on it reads at 4.97:1), and the chocolate
 * focus outline.
 */

const checkboxVariants = {
  default: "size-4 rounded-sm border-2",
  stamp: "size-6 rounded-md border-2",
} as const;

const indicatorIconVariants = {
  default: "size-3",
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
      "peer group shrink-0 border-(--color-stamp-taupe) bg-(--color-stamp-white) text-(--color-stamp-chocolate) transition-colors duration-200 hover:border-(--color-stamp-chocolate) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate) data-[state=checked]:border-(--color-stamp-gold) data-[state=checked]:bg-(--color-stamp-gold) data-[state=indeterminate]:border-(--color-stamp-gold) data-[state=indeterminate]:bg-(--color-stamp-gold) disabled:cursor-not-allowed disabled:opacity-50",
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
