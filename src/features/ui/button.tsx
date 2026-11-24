"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { AnalyticsService } from "@/shared/services/analyticsService";
import type { AnalyticsEventNameT } from "@/shared/types/analytics";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-button font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--color-stamp-chocolate) aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      // NOTE: definition order matters — cva emits classes in this order and
      // tailwind-merge resolves conflicts last-wins. `size` is defined FIRST so
      // variants that carry their own dimensions (cta, *-compact, stamp-*)
      // override the default size instead of being clobbered by it.
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
      variant: {
        default:
          "bg-(--color-stamp-chocolate) font-semibold text-(--color-stamp-white) hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate)",
        destructive:
          "bg-(--color-stamp-error) font-semibold text-(--color-stamp-white) hover:bg-(--color-stamp-error)/90 focus-visible:ring-(--color-stamp-error)",
        ghost:
          "text-(--color-stamp-chocolate) hover:bg-(--color-stamp-cream) hover:text-(--color-stamp-chocolate)",
        link: "text-(--color-stamp-chocolate) underline-offset-4 hover:underline hover:text-(--color-stamp-gold-text) focus-visible:ring-offset-0 rounded-none",
        // Stamp actions: rounded-lg corners, uppercase labels with moderate
        // tracking, and a small offset "stamp" lift on hover. Chocolate fill,
        // amber hover.
        primary:
          "h-auto bg-(--color-stamp-chocolate) px-6 py-3.5 md:px-7 md:py-4 font-bold uppercase tracking-wide text-sm text-(--color-stamp-white) hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-stamp-card-hover) active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed",
        "primary-compact":
          "h-auto bg-(--color-stamp-chocolate) px-5 py-3 font-bold uppercase tracking-wide text-sm text-(--color-stamp-white) hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-stamp-card-hover) active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed",
        secondary:
          "h-auto border-2 border-(--color-stamp-chocolate) bg-transparent px-6 py-3 md:px-7 md:py-3.5 font-bold uppercase tracking-wide text-sm text-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-stamp-card-hover) active:translate-x-0 active:translate-y-0 active:shadow-none",
        "secondary-compact":
          "h-auto border-2 border-(--color-stamp-chocolate) bg-transparent px-5 py-2.5 font-bold uppercase tracking-wide text-sm text-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-stamp-card-hover) active:translate-x-0 active:translate-y-0 active:shadow-none",
        cta: "h-auto bg-(--color-stamp-chocolate) px-10 py-5 md:px-12 md:py-5.5 font-bold uppercase tracking-wide text-base md:text-lg text-(--color-stamp-white) hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-stamp-card-hover) active:translate-x-0 active:translate-y-0 active:shadow-none",
        "cta-gold":
          "h-auto bg-(--color-stamp-gold) px-10 py-5 md:px-12 md:py-5.5 font-bold uppercase tracking-wide text-base md:text-lg text-(--color-stamp-chocolate) hover:bg-(--color-stamp-off-white) hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-stamp-card-hover) active:translate-x-0 active:translate-y-0 active:shadow-none",
        "ghost-stamp":
          "h-auto bg-transparent px-6 py-3.5 md:px-7 font-bold uppercase tracking-wide text-sm text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold-text) hover:bg-(--color-stamp-chocolate)/5",
        "ghost-stamp-light":
          "h-auto bg-transparent px-6 py-3.5 md:px-7 font-bold uppercase tracking-wide text-sm text-(--color-stamp-off-white) hover:text-(--color-stamp-gold-light) hover:bg-(--color-stamp-off-white)/10",
        "stamp-close":
          "h-10 w-10 bg-(--color-stamp-white) hover:bg-(--color-stamp-cream) border border-(--color-stamp-divider) shadow-(--shadow-stamp-card) hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-stamp-card-hover) active:translate-x-0 active:translate-y-0 active:shadow-none",
        "stamp-google":
          "w-full gap-4 border-2 border-(--color-stamp-divider) bg-(--color-stamp-white) py-4 px-6 font-bold uppercase tracking-wide text-sm text-(--color-stamp-chocolate) hover:border-(--color-stamp-chocolate) hover:bg-(--color-stamp-cream) hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-stamp-card-hover) active:translate-x-0 active:translate-y-0 active:shadow-none",
        "stamp-thumbnail":
          "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 border-(--color-stamp-divider) p-0 not-aria-pressed:hover:border-(--color-stamp-chocolate) aria-pressed:border-(--color-stamp-gold) aria-pressed:ring-2 aria-pressed:ring-(--color-stamp-gold)/20 shadow-sm",
        "stamp-disclosure":
          "flex w-full h-auto cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-(--color-stamp-gold)/5",
        "stamp-filter":
          "h-10 border-2 border-(--color-stamp-divider) bg-(--color-stamp-white) px-4 font-bold uppercase tracking-wide text-sm text-(--color-stamp-chocolate) shadow-none hover:border-(--color-stamp-chocolate)",
        "stamp-filter-ghost":
          "h-10 bg-transparent px-4 font-bold uppercase tracking-wide text-sm text-(--color-stamp-taupe) hover:bg-transparent hover:text-(--color-stamp-gold-text)",
        "stamp-expand":
          "h-auto w-full justify-center gap-1 py-1.5 text-xs font-bold uppercase tracking-wide text-(--color-stamp-gold-text) hover:text-(--color-stamp-chocolate) hover:bg-(--color-stamp-gold)/10",
        unstyled: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * Minimal base styles for unstyled buttons - only essential focus/disabled states
 */
const unstyledBase =
  "outline-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

type IconButtonSize = "icon" | "icon-sm" | "icon-lg";

// Base button props without size
type BaseButtonProps = Omit<React.ComponentProps<"button">, "size"> &
  Omit<VariantProps<typeof buttonVariants>, "size"> & {
    asChild?: boolean;
    /** GA4 event name; when set, clicks are tracked automatically */
    trackingId?: AnalyticsEventNameT;
    /** Additional parameters sent with the tracking event */
    trackingData?: Record<string, string | number>;
  };

// Icon button props - aria-label is required
type IconButtonProps = BaseButtonProps & {
  size: IconButtonSize;
  "aria-label": string;
};

// Regular button props - aria-label is optional
type RegularButtonProps = BaseButtonProps & {
  size?: Exclude<VariantProps<typeof buttonVariants>["size"], IconButtonSize>;
  "aria-label"?: string;
};

// Union type: if size is icon variant, aria-label is required
type ButtonProps = IconButtonProps | RegularButtonProps;

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  disabled,
  "aria-label": ariaLabel,
  trackingId,
  trackingData,
  onClick,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (trackingId) {
      AnalyticsService.track(trackingId, trackingData);
    }
    onClick?.(event);
  };

  // Development warning for icon buttons without aria-label
  if (process.env.NODE_ENV === "development") {
    const isIconButton =
      size === "icon" || size === "icon-sm" || size === "icon-lg";
    if (isIconButton && !ariaLabel && !props.children) {
      console.warn(
        `[Button Accessibility Warning]: Icon buttons (size="${size}") require an aria-label for screen reader support. Please add aria-label prop.`,
      );
    }
  }

  // For unstyled variant, skip cva base styles entirely
  const computedClassName =
    variant === "unstyled"
      ? cn(unstyledBase, className)
      : cn(buttonVariants({ variant, size, className }));

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={variant === "unstyled" ? undefined : size}
      className={computedClassName}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      onClick={handleClick}
      {...props}
    />
  );
}

export { Button, buttonVariants };
