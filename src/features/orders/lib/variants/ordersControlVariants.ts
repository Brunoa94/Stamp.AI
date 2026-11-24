import { cva } from "class-variance-authority";

const focusRing =
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)";

/** List/grid view toggle icon button: chocolate on cream when active. */
export const ordersViewToggleVariants = cva(
  "h-10 w-10 transition-colors hover:bg-(--color-stamp-cream) hover:text-(--color-stamp-chocolate)",
  {
    variants: {
      active: {
        true: "bg-(--color-stamp-cream) text-(--color-stamp-chocolate)",
        false: "text-(--color-stamp-taupe)",
      },
    },
    defaultVariants: { active: false },
  },
);

/** Pagination page button (used with `Button variant="unstyled"`). */
export const ordersPageButtonVariants = cva(
  `inline-flex size-10 items-center justify-center rounded-lg border-2 text-sm font-bold transition-colors disabled:cursor-not-allowed ${focusRing}`,
  {
    variants: {
      active: {
        true: "border-(--color-stamp-chocolate) bg-(--color-stamp-chocolate) text-(--color-stamp-white)",
        false:
          "border-(--color-stamp-divider) bg-(--color-stamp-white) text-(--color-stamp-chocolate) hover:border-(--color-stamp-chocolate)",
      },
    },
    defaultVariants: { active: false },
  },
);
