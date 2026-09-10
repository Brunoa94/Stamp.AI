"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Slider
 *
 * A range input component styled for the stamp design system.
 * Uses CSS custom properties for theming compatibility.
 */

interface SliderProps extends Omit<React.ComponentProps<"input">, "type"> {
  /** Additional class names for the slider */
  className?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        data-slot="slider"
        className={cn(
          "h-px w-full cursor-pointer appearance-none bg-(--color-stamp-divider)",
          "[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-(--color-stamp-gold)",
          "[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-(--color-stamp-gold)",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
