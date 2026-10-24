import { cva } from "class-variance-authority";

/** Bordered option box in the flow demo's mock screens; gold when selected. */
export const flowBoxVariants = cva("", {
  variants: {
    selected: {
      true: "border-2 border-(--color-stamp-gold)",
      false: "border border-(--color-stamp-chocolate)/10",
    },
  },
  defaultVariants: { selected: false },
});
