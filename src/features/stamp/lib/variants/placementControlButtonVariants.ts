import { cva } from "class-variance-authority";

/** Square step button for the placement adjuster (nudge arrows, scale ±). */
export const placementControlButtonVariants = cva(
  "h-9 w-9 rounded-none border border-(--color-stamp-divider) p-0 text-(--color-stamp-taupe) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-chocolate)",
);
