import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Textarea
 *
 * Multi-line version of the stamp field (see `Input`): rounded-lg, cream
 * surface, 2px divider border, chocolate text, taupe placeholder and a
 * chocolate border and ring on focus.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-lg border-2 border-(--color-stamp-taupe)/70 bg-(--color-stamp-cream) px-4 py-3 text-base text-(--color-stamp-chocolate) shadow-none transition-[color,background-color,border-color,box-shadow] duration-200 outline-none",
        "placeholder:text-(--color-stamp-taupe)",
        "focus-visible:border-(--color-stamp-chocolate) focus-visible:bg-(--color-stamp-white) focus-visible:ring-2 focus-visible:ring-(--color-stamp-chocolate)/15",
        "aria-invalid:border-(--color-stamp-error) aria-invalid:focus-visible:ring-(--color-stamp-error)/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
