import { cva } from "class-variance-authority";

/**
 * Selectable option card in the buy-credits flow (credit packages, the custom
 * amount and payment methods). Used with `Button variant="unstyled"`, so it
 * carries its own chocolate focus ring. Selection is a chocolate border on a
 * cream fill (amber fails 3:1 as a border on white).
 */
export const creditOptionCardVariants = cva(
  "relative h-auto rounded-xl border-2 text-(--color-stamp-chocolate) transition-all duration-200 cursor-pointer focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
  {
    variants: {
      selected: {
        true: "border-(--color-stamp-chocolate) bg-(--color-stamp-cream)",
        false:
          "border-(--color-stamp-divider) bg-(--color-stamp-white) hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-(--color-stamp-chocolate)/40 hover:shadow-(--shadow-stamp-card-hover)",
      },
    },
    defaultVariants: { selected: false },
  },
);

/** Icon inside an option card: amber text when selected, taupe otherwise. */
export const creditOptionIconVariants = cva("shrink-0", {
  variants: {
    selected: {
      true: "text-(--color-stamp-gold-text)",
      false: "text-(--color-stamp-taupe)",
    },
  },
  defaultVariants: { selected: false },
});

/** Rounded tile behind the coin icon of the custom amount option. */
export const creditIconTileVariants = cva(
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
  {
    variants: {
      selected: {
        true: "bg-(--color-stamp-gold)/15",
        false: "bg-(--color-stamp-cream)",
      },
    },
    defaultVariants: { selected: false },
  },
);
