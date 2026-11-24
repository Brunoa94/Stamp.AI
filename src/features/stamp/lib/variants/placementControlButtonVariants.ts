import { cva } from "class-variance-authority";

/**
 * Square step button for the placement adjuster (nudge arrows, scale ±):
 * a rounded-lg white control with a divider border that darkens on hover.
 * Use with `<Button variant="unstyled">`.
 */
export const placementControlButtonVariants = cva(
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-(--color-stamp-divider) bg-(--color-stamp-white) p-0 text-(--color-stamp-taupe) transition-colors hover:border-(--color-stamp-chocolate) hover:text-(--color-stamp-chocolate) disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
);
