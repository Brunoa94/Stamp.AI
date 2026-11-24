import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input
 *
 * The stamp field: rounded-lg, cream surface with a 2px divider border,
 * chocolate text and taupe placeholder. Focus turns the border chocolate with
 * a soft chocolate ring (the surface brightens to white); an invalid field
 * (`aria-invalid`) gets the error border. Every form uses this look, so
 * callers only add layout (padding for icons, width) through `className`.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-lg border-2 border-(--color-stamp-taupe)/70 bg-(--color-stamp-cream) px-4 py-2 text-base font-normal text-(--color-stamp-chocolate) shadow-none transition-[color,background-color,border-color,box-shadow] duration-200 outline-none",
        "placeholder:text-(--color-stamp-taupe) selection:bg-(--color-stamp-gold) selection:text-(--color-stamp-chocolate)",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-base file:font-normal file:text-(--color-stamp-chocolate)",
        "focus-visible:border-(--color-stamp-chocolate) focus-visible:bg-(--color-stamp-white) focus-visible:ring-2 focus-visible:ring-(--color-stamp-chocolate)/15",
        "aria-invalid:border-(--color-stamp-error) aria-invalid:focus-visible:ring-(--color-stamp-error)/15",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
