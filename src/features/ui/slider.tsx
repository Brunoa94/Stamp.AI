import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sliderVariants = cva(
  "w-full appearance-none cursor-pointer rounded-full bg-ink/10",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
      },
      accentColor: {
        cyan: [
          "accent-brandCyan",
          "[&::-webkit-slider-thumb]:bg-brandCyan",
          "[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.5)]",
          "[&::-moz-range-thumb]:bg-brandCyan",
        ].join(" "),
        purple: [
          "accent-brandPurple",
          "[&::-webkit-slider-thumb]:bg-brandPurple",
          "[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(147,51,234,0.5)]",
          "[&::-moz-range-thumb]:bg-brandPurple",
        ].join(" "),
        orange: [
          "accent-brandOrange",
          "[&::-webkit-slider-thumb]:bg-brandOrange",
          "[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(251,146,60,0.5)]",
          "[&::-moz-range-thumb]:bg-brandOrange",
        ].join(" "),
      },
    },
    defaultVariants: {
      size: "md",
      accentColor: "cyan",
    },
  },
);

const thumbStyles = [
  "[&::-webkit-slider-thumb]:appearance-none",
  "[&::-webkit-slider-thumb]:w-4",
  "[&::-webkit-slider-thumb]:h-4",
  "[&::-webkit-slider-thumb]:rounded-full",
  "[&::-webkit-slider-thumb]:cursor-pointer",
  "[&::-moz-range-thumb]:w-4",
  "[&::-moz-range-thumb]:h-4",
  "[&::-moz-range-thumb]:rounded-full",
  "[&::-moz-range-thumb]:border-0",
  "[&::-moz-range-thumb]:cursor-pointer",
].join(" ");

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
    VariantProps<typeof sliderVariants> {}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, size, accentColor, ...props }, ref) => {
    return (
      <input
        type="range"
        className={cn(
          sliderVariants({ size, accentColor }),
          thumbStyles,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Slider.displayName = "Slider";

export { Slider, sliderVariants };
