import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
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
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive dark:focus-visible:ring-destructive/80 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-offset-0",
        "brutalist-primary":
          "h-auto bg-ink px-6 md:px-8 py-1.5 md:py-2 font-heading text-sm md:text-base tracking-widest uppercase border-2 border-brandCyan hover:bg-brandCyan hover:text-ink transition-colors duration-300 shadow-[4px_4px_0px_rgba(10,10,10,0.1)] text-white",
        "brutalist-ghost":
          "h-auto border border-ink/10 px-4 py-2 hover:border-brandCyan hover:bg-transparent transition-colors",
        "brutalist-danger":
          "h-auto w-full flex items-center justify-center gap-2 text-brandCyan font-bold text-[10px] tracking-widest uppercase hover:text-brandRed hover:bg-transparent transition-colors border border-brandCyan/20 py-2 font-heading",
        primary:
          "h-auto bg-(--color-stamp-chocolate) px-6 py-4 md:px-8 md:py-6 font-heading text-xs font-bold uppercase tracking-[0.2em] text-(--color-stamp-white) transition-all duration-300 hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
        "primary-compact":
          "h-auto bg-(--color-stamp-chocolate) px-4 py-3 font-heading text-xs font-bold uppercase tracking-[0.2em] text-(--color-stamp-white) transition-all duration-300 hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
        secondary:
          "h-auto border-2 border-(--color-stamp-divider) bg-transparent px-6 py-4 md:px-8 md:py-6 font-heading text-xs font-bold uppercase tracking-[0.2em] text-(--color-stamp-chocolate) transition-all duration-300 hover:border-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) active:scale-[0.98]",
        "secondary-compact":
          "h-auto border-2 border-(--color-stamp-divider) bg-transparent px-4 py-3 font-heading text-xs font-bold uppercase tracking-[0.2em] text-(--color-stamp-chocolate) transition-all duration-300 hover:border-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) active:scale-[0.98]",
        cta: "h-auto bg-(--color-stamp-chocolate) px-16 py-7 md:px-24 md:py-9 font-heading text-lg md:text-xl font-bold uppercase tracking-[0.125em] text-(--color-stamp-white) transition-all duration-300 hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50",
        "cta-gold":
          "h-auto bg-(--color-stamp-gold) px-16 py-7 md:px-24 md:py-9 font-heading text-lg md:text-xl font-bold uppercase tracking-[0.125em] text-(--color-stamp-chocolate) transition-all duration-300 hover:bg-(--color-stamp-off-white) active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50",
        "ghost-stamp":
          "h-auto bg-transparent px-6 py-4 md:px-8 md:py-5 font-heading text-base md:text-lg font-bold uppercase tracking-[0.15em] text-(--color-stamp-chocolate) transition-all duration-300 hover:text-(--color-stamp-gold) hover:bg-(--color-stamp-chocolate)/5",
        "ghost-stamp-light":
          "h-auto bg-transparent px-6 py-4 md:px-8 md:py-5 font-heading text-base md:text-lg font-bold uppercase tracking-[0.15em] text-(--color-stamp-off-white) transition-all duration-300 hover:text-(--color-stamp-gold) hover:bg-(--color-stamp-off-white)/5",
        "stamp-close":
          "h-10 w-10 bg-(--color-stamp-cream) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) transition-all border border-(--color-stamp-divider)",
        "stamp-google":
          "w-full gap-4 border-2 border-(--color-stamp-divider) bg-(--color-stamp-white) py-6 px-6 font-heading font-bold text-base uppercase tracking-widest text-(--color-stamp-chocolate) transition-all hover:border-(--color-stamp-taupe) hover:bg-(--color-stamp-cream)",
        "stamp-thumbnail":
          "relative h-20 w-20 shrink-0 overflow-hidden rounded-none border-2 border-(--color-stamp-divider) p-0 transition-all duration-300 not-aria-pressed:hover:border-(--color-stamp-chocolate) aria-pressed:border-(--color-stamp-gold) aria-pressed:ring-2 aria-pressed:ring-(--color-stamp-gold)/20",
        "stamp-disclosure":
          "flex w-full h-auto cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-(--color-stamp-gold)/5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type IconButtonSize = "icon" | "icon-sm" | "icon-lg";

// Base button props without size
type BaseButtonProps = Omit<React.ComponentProps<"button">, "size"> &
  Omit<VariantProps<typeof buttonVariants>, "size"> & {
    asChild?: boolean;
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
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

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

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    />
  );
}

export { Button };
