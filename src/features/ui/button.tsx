import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary:
          "h-auto w-full rounded-none bg-ink px-6 py-4 font-anton text-xl tracking-widest uppercase text-white hover:bg-brandCyan hover:text-ink transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
        "stamp-primary":
          "h-auto bg-(--color-stamp-chocolate) px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        "stamp-outline":
          "h-auto bg-transparent border border-(--color-stamp-divider) px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase text-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-white hover:border-(--color-stamp-chocolate) transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        toggle:
          "rounded-none border border-ink/10 bg-white font-anton text-lg text-ink hover:border-purple hover:bg-purple hover:text-white transition-all disabled:opacity-30",
        "toggle-active":
          "rounded-none bg-purple font-anton text-lg text-white hover:bg-purple hover:text-white transition-all",
        "ghost-active":
          "bg-purple/10 text-purple hover:bg-purple/20 transition-colors",
        "card-outline":
          "h-auto rounded-none border border-ink/20 bg-transparent px-6 py-2 font-anton text-xs tracking-widest uppercase text-ink transition-all hover:bg-transparent hover:text-ink group-hover:border-white/40",
        "card-outline-danger":
          "h-auto rounded-none border border-ink/20 bg-transparent px-6 py-2 font-anton text-xs tracking-widest uppercase text-brandRed transition-all hover:bg-transparent hover:text-brandRed group-hover:border-white/40",
        "card-solid":
          "h-auto rounded-none bg-ink px-6 py-2 font-anton text-xs tracking-widest uppercase text-white transition-all group-hover:bg-white group-hover:text-ink",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive dark:focus-visible:ring-destructive/80 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-offset-0",
        "brutalist-primary":
          "h-auto rounded-none bg-ink px-6 md:px-8 py-1.5 md:py-2 font-anton text-sm md:text-base tracking-widest uppercase border-2 border-brandCyan hover:bg-brandCyan hover:text-ink transition-colors duration-300 shadow-[4px_4px_0px_rgba(10,10,10,0.1)] text-white",
        "brutalist-checkout":
          "h-auto rounded-none bg-ink px-6 md:px-8 py-6 md:py-8 font-anton text-xl md:text-2xl tracking-widest uppercase border-2 border-brandCyan hover:bg-brandCyan hover:text-ink transition-colors duration-300 shadow-[4px_4px_0px_rgba(10,10,10,0.1)] text-white",
        "brutalist-ghost":
          "h-auto rounded-none border border-ink/10 px-4 py-2 hover:border-brandCyan hover:bg-transparent transition-colors",
        "brutalist-danger":
          "h-auto w-full rounded-none flex items-center justify-center gap-2 text-brandCyan font-bold text-[10px] tracking-widest uppercase hover:text-brandRed hover:bg-transparent transition-colors border border-brandCyan/20 py-2 font-space",
        "auth-primary":
          "btn-gradient w-full py-5 px-6 rounded-full bg-ink font-anton text-xl uppercase tracking-[0.2em] text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 flex items-center justify-center relative overflow-hidden",
        "auth-cancel":
          "w-full py-5 px-6 rounded-full border border-ink/10 bg-white font-anton text-xl uppercase tracking-[0.2em] text-ink hover:bg-concrete transition-all duration-300",
        "auth-close":
          "h-10 w-10 rounded-full bg-concrete hover:bg-ink hover:text-white transition-all",
        "auth-google":
          "w-full gap-4 rounded-2xl border border-ink/5 bg-white py-4 px-6 font-bold text-sm text-ink/70 shadow-sm transition-shadow hover:shadow-md",
        "dashboard-edit":
          "w-full mt-6 py-3 border border-ink/10 hover:border-purple hover:bg-purple/5 font-anton text-xs tracking-widest uppercase transition-all flex items-center justify-center text-purple",
        "dashboard-primary":
          "w-full py-3 bg-purple hover:bg-purple/90 text-white font-anton text-xs tracking-widest uppercase transition-all",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        "icon-xl": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type IconButtonSize = "icon" | "icon-sm" | "icon-lg" | "icon-xl";

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
export type ButtonProps = IconButtonProps | RegularButtonProps;

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
      size === "icon" ||
      size === "icon-sm" ||
      size === "icon-lg" ||
      size === "icon-xl";
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

export { Button, buttonVariants };
