"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { AnalyticsService } from "@/services/analyticsService";
import type { AnalyticsEventNameT } from "@/features/analytics/types/analyticsTypes";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
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
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg",
        destructive:
          "bg-destructive text-white shadow-md hover:bg-destructive/90 hover:shadow-lg focus-visible:ring-destructive dark:focus-visible:ring-destructive/80 dark:bg-destructive/60",
        outline:
          "border-2 border-(--color-stamp-divider) bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-offset-0 rounded-none",
        "brutalist-primary":
          "h-auto bg-ink px-6 md:px-8 py-3 md:py-4 font-heading text-sm md:text-base font-bold tracking-widest uppercase border-2 border-brandCyan hover:bg-brandCyan hover:text-ink shadow-md hover:shadow-lg text-white",
        "brutalist-ghost":
          "h-auto border-2 border-ink/10 px-4 py-3 font-bold uppercase tracking-wider hover:border-brandCyan hover:bg-transparent",
        "brutalist-danger":
          "h-auto w-full flex items-center justify-center gap-2 text-brandCyan font-bold text-xs tracking-widest uppercase hover:text-brandRed hover:bg-transparent border-2 border-brandCyan/20 py-3 font-heading",
        primary:
          "h-auto bg-(--color-stamp-chocolate) px-6 py-4 md:px-8 md:py-5 font-body font-bold text-sm uppercase tracking-wider text-(--color-stamp-white) hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) active:scale-[0.98] shadow-md hover:shadow-lg disabled:cursor-not-allowed",
        "primary-compact":
          "h-auto bg-(--color-stamp-chocolate) px-4 py-3 font-body font-bold text-sm uppercase tracking-wider text-(--color-stamp-white) hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) active:scale-[0.98] shadow-md hover:shadow-lg disabled:cursor-not-allowed",
        secondary:
          "h-auto border-2 border-(--color-stamp-divider) bg-transparent px-6 py-4 md:px-8 md:py-5 font-body font-bold text-sm uppercase tracking-wider text-(--color-stamp-chocolate) hover:border-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) hover:shadow-md active:scale-[0.98]",
        "secondary-compact":
          "h-auto border-2 border-(--color-stamp-divider) bg-transparent px-4 py-3 font-body font-bold text-sm uppercase tracking-wider text-(--color-stamp-chocolate) hover:border-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) hover:shadow-md active:scale-[0.98]",
        cta: "h-auto bg-(--color-stamp-chocolate) px-12 py-6 md:px-16 md:py-7 font-semibold text-base md:text-lg uppercase tracking-wider text-(--color-stamp-white) hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) active:scale-[0.98] shadow-md hover:shadow-lg",
        "cta-gold":
          "h-auto bg-(--color-stamp-gold) px-12 py-6 md:px-16 md:py-7 font-semibold text-base md:text-lg uppercase tracking-wider text-(--color-stamp-chocolate) hover:bg-(--color-stamp-off-white) active:scale-[0.98] shadow-md hover:shadow-lg",
        "ghost-stamp":
          "h-auto bg-transparent px-6 py-4 md:px-8 md:py-5 font-semibold text-sm md:text-base uppercase tracking-wider text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) hover:bg-(--color-stamp-chocolate)/5",
        "ghost-stamp-light":
          "h-auto bg-transparent px-6 py-4 md:px-8 md:py-5 font-semibold text-sm md:text-base uppercase tracking-wider text-(--color-stamp-off-white) hover:text-(--color-stamp-gold) hover:bg-(--color-stamp-off-white)/5",
        "stamp-close":
          "h-10 w-10 bg-(--color-stamp-cream) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) border border-(--color-stamp-divider) shadow-sm hover:shadow-md",
        "stamp-google":
          "w-full gap-4 border-2 border-(--color-stamp-divider) bg-(--color-stamp-white) py-5 px-6 font-semibold text-sm uppercase tracking-wider text-(--color-stamp-chocolate) hover:border-(--color-stamp-taupe) hover:bg-(--color-stamp-cream) shadow-sm hover:shadow-md",
        "stamp-thumbnail":
          "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 border-(--color-stamp-divider) p-0 not-aria-pressed:hover:border-(--color-stamp-chocolate) aria-pressed:border-(--color-stamp-gold) aria-pressed:ring-2 aria-pressed:ring-(--color-stamp-gold)/20 shadow-sm",
        "stamp-disclosure":
          "flex w-full h-auto cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-(--color-stamp-gold)/5",
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

export { Button };
