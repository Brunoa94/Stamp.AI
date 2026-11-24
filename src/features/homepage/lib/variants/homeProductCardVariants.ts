import { cva } from "class-variance-authority";

/** Background tint of a homepage product card; the grid cycles through them. */
export const homeProductCardVariants = cva("", {
  variants: {
    tint: {
      mint: "bg-(--color-stamp-card-mint)",
      sand: "bg-(--color-stamp-card-sand)",
      lavender: "bg-(--color-stamp-card-lavender)",
      rose: "bg-(--color-stamp-card-rose)",
    },
  },
  defaultVariants: { tint: "mint" },
});
