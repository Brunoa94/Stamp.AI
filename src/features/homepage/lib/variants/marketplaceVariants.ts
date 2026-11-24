import { cva } from "class-variance-authority";

/** Gift-idea tile: the large tile fills its two-by-two cell, small ones stay 4:3. */
export const giftIdeaTileVariants = cva(
  "group relative block h-full w-full overflow-hidden rounded-xl border-4 border-(--color-stamp-white) bg-(--color-stamp-sage) shadow-(--shadow-stamp-card) transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-stamp-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
  {
    variants: {
      size: {
        large: "aspect-square lg:aspect-auto",
        small: "aspect-4/3",
      },
    },
  },
);

/** Label inside a gift-idea tile: an uppercase cream tag. */
export const giftIdeaLabelVariants = cva(
  "absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-(--color-stamp-off-white) px-3 py-2 font-bold uppercase tracking-wider text-(--color-stamp-chocolate) shadow-(--shadow-stamp-card) transition-colors duration-200 group-hover:bg-(--color-stamp-gold)",
  {
    variants: {
      size: {
        large: "text-sm md:bottom-5 md:left-5",
        small: "text-xs",
      },
    },
  },
);
