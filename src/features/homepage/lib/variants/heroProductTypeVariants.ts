import { cva } from "class-variance-authority";

/**
 * A product-type banner under the hero's two blocks: a tinted link card with
 * the product photo on the left; lifts into the offset stamp shadow on hover.
 */
export const heroProductTypeVariants = cva(
  "group flex items-center gap-4 rounded-md border border-transparent p-3 pr-4 transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-stamp-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
  {
    variants: {
      tone: {
        peach: "bg-(--color-stamp-peach)",
        sage: "bg-(--color-stamp-sage)",
        sand: "bg-(--color-flow-art-backdrop-sand)",
        cream: "border-(--color-stamp-divider) bg-(--color-stamp-cream)",
      },
    },
  },
);
