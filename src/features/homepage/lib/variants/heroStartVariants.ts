import { cva } from "class-variance-authority";

/**
 * The hero's start card ("Upload a photo to start" / "Describe your idea"): a
 * dashed amber link card on the cream hero card that opens the studio.
 */
export const heroStartCardVariants = cva(
  "group flex w-full items-center gap-4 rounded-xl border-2 border-dashed border-(--color-stamp-gold) bg-(--color-stamp-white) p-4 text-left shadow-(--shadow-stamp-card) transition-all duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-solid hover:shadow-(--shadow-stamp-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate) sm:gap-5 sm:p-5",
);

/** Amber square holding the start card's icon; turns chocolate on hover. */
export const heroStartIconTileVariants = cva(
  "flex size-14 shrink-0 items-center justify-center rounded-lg bg-(--color-stamp-gold) transition-colors duration-300 group-hover:bg-(--color-stamp-chocolate) sm:size-16",
);

/** Icon inside the amber square. */
export const heroStartIconVariants = cva(
  "size-7 text-(--color-stamp-chocolate) transition-colors duration-300 group-hover:text-(--color-stamp-white)",
);

/**
 * One of the two "how to start" toggles above the start card, in a white
 * segmented control. The pressed one is chocolate.
 */
export const heroStartToggleVariants = cva(
  "flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
  {
    variants: {
      pressed: {
        true: "bg-(--color-stamp-chocolate) text-(--color-stamp-white)",
        false: "text-(--color-stamp-chocolate) hover:bg-(--color-stamp-cream)",
      },
    },
    defaultVariants: { pressed: false },
  },
);
