import { cva } from "class-variance-authority";

/**
 * Shared surfaces of the design studio (/stamp), in the Stamp look: rounded-xl
 * white cards with a divider border and soft shadow, a small offset "stamp"
 * lift on hover for selectable cards, chocolate focus rings. Pair these with
 * `<Button variant="unstyled">` so the button's own ring doesn't stack.
 * `focus-visible:outline-solid` replaces the unstyled button's outline-none.
 */

/** Static white card: file info, product summary, disclosure rows, overlay cards. */
export const stampCardVariants = cva(
  "rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) shadow-(--shadow-stamp-card)",
);

/**
 * Selectable card (suggestion tiles, product cards, section picker). Selected
 * is a chocolate border (amber fails 3:1 on white); unselected lifts on hover.
 */
export const stampSelectableCardVariants = cva(
  "rounded-xl border bg-(--color-stamp-white) shadow-(--shadow-stamp-card) transition-all duration-200 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
  {
    variants: {
      selected: {
        true: "border-(--color-stamp-chocolate) ring-1 ring-(--color-stamp-chocolate)",
        false:
          "border-(--color-stamp-divider) hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-(--color-stamp-chocolate)/30 hover:shadow-(--shadow-stamp-card-hover)",
      },
    },
    defaultVariants: { selected: false },
  },
);

/**
 * Small option control (paper type, rotation preset, print position, reset).
 * Selected is a chocolate border on a cream fill. `compact` is a one-line
 * uppercase chip; `card` stacks an icon and two lines of copy.
 */
export const stampChipVariants = cva(
  "rounded-lg border bg-(--color-stamp-white) text-(--color-stamp-chocolate) transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
  {
    variants: {
      selected: {
        true: "border-(--color-stamp-chocolate) bg-(--color-stamp-cream)",
        false: "border-(--color-stamp-divider) hover:border-(--color-stamp-chocolate)",
      },
      size: {
        compact:
          "inline-flex h-9 items-center justify-center gap-2 px-3 text-xs font-bold uppercase tracking-wide",
        card: "flex h-auto flex-col items-start gap-1 px-4 py-3 text-left",
      },
    },
    defaultVariants: { selected: false, size: "compact" },
  },
);

/** Round icon control on a light surface (carousel arrows). */
export const stampRoundIconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-(--color-stamp-divider) bg-(--color-stamp-white) p-2 text-(--color-stamp-chocolate) transition-colors hover:border-(--color-stamp-chocolate) focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
);

/** Round icon control inside the chocolate fullscreen lightbox. */
export const stampLightboxButtonVariants = cva(
  "rounded-full bg-(--color-stamp-off-white)/10 p-3 text-(--color-stamp-off-white) transition-all duration-300 hover:bg-(--color-stamp-off-white)/20 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-off-white)",
);
