"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Slider
 *
 * A range input in the stamp look: a soft chocolate track, an amber thumb
 * ringed in chocolate (amber alone fails 3:1 on light surfaces) and the
 * chocolate focus outline.
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
          "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-(--color-stamp-chocolate)/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-stamp-chocolate)",
          "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-(--color-stamp-chocolate) [&::-webkit-slider-thumb]:bg-(--color-stamp-gold)",
          "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-(--color-stamp-chocolate) [&::-moz-range-thumb]:bg-(--color-stamp-gold)",
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
