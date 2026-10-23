import { cva } from "class-variance-authority";

/** Status dot beside each step in the flow demo's rail. */
export const flowRailDotVariants = cva("size-1.75 shrink-0 rounded-full", {
  variants: {
    status: {
      active: "bg-(--color-stamp-gold) animate-flow-pulse",
      done: "bg-(--color-stamp-chocolate)/40",
      upcoming: "bg-(--color-stamp-chocolate)/10",
    },
  },
});

/** Step label button in the flow demo's rail. */
export const flowRailLabelVariants = cva(
  "min-h-8 cursor-pointer rounded-sm text-left font-body text-xs uppercase tracking-wide hover:text-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)",
  {
    variants: {
      status: {
        active: "font-semibold text-(--color-stamp-chocolate)",
        done: "text-(--color-stamp-taupe)",
        upcoming: "text-(--color-stamp-taupe)",
      },
    },
  },
);
