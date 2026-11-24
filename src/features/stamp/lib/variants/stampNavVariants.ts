import { cva } from "class-variance-authority";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)";

/** Account/text link in the Stamp header and mobile drawer: uppercase, tracked. */
export const stampNavLinkVariants = cva(
  `whitespace-nowrap rounded-lg text-xs font-bold uppercase tracking-wider text-(--color-stamp-chocolate) transition-colors duration-200 hover:text-(--color-stamp-gold-text) ${focusRing}`,
);

/**
 * Desktop header link with a leading icon. `iconOnly` makes it a square icon
 * button (the bag), whose name then comes from its aria-label.
 */
export const stampNavIconLinkVariants = cva(
  `group relative inline-flex items-center rounded-lg text-(--color-stamp-chocolate) transition-colors duration-200 hover:bg-(--color-stamp-cream) hover:text-(--color-stamp-gold-text) ${focusRing}`,
  {
    variants: {
      iconOnly: {
        true: "size-10 justify-center",
        false: "gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider",
      },
    },
    defaultVariants: { iconOnly: false },
  },
);

/** Icon inside a header link; the cart's is a size up so it reads at a glance. */
export const stampNavIconVariants = cva("shrink-0", {
  variants: {
    size: {
      md: "size-5",
      lg: "size-6",
    },
  },
  defaultVariants: { size: "md" },
});

/**
 * "Sign up" trigger in the header: the solid amber action. The auth dialog
 * renders it as an unstyled Button, whose `outline-none` would cancel an
 * outline, so its focus indicator is a ring.
 */
export const stampNavSignUpVariants = cva(
  "inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-(--color-stamp-gold) px-4 text-xs font-bold uppercase tracking-wider text-(--color-stamp-chocolate) transition-colors duration-200 hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-(--color-stamp-chocolate) focus-visible:ring-offset-2",
);

/**
 * Label bubble under a header link that shows only its icon. It appears on
 * hover and on keyboard focus (a `title` would only show on hover). `compact`
 * links show their own label from `xl`, so the bubble stops there.
 */
export const stampNavTooltipVariants = cva(
  "pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-(--color-stamp-chocolate) px-2.5 py-1 text-sm font-semibold normal-case tracking-normal text-(--color-stamp-white) opacity-0 shadow-(--shadow-stamp-card) transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
  {
    variants: {
      compact: {
        true: "xl:hidden",
        false: "",
      },
    },
    defaultVariants: { compact: false },
  },
);

/**
 * The header's "describe your idea" bar, centre stage in the top row the way a
 * marketplace centres its search: a white field with an upload tile at the
 * start and "Stamp it!" at the end, opening the design studio. A size smaller
 * in the phone row under the logo. Its amber border and glow are animated by
 * `.stamp-prompt-bar` in globals-stamp.css.
 */
export const stampNavPromptBarVariants = cva(
  `stamp-prompt-bar group flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-xl border-2 p-0.5 text-left transition-[box-shadow,translate] duration-200 hover:-translate-y-px md:h-11 md:gap-3 md:p-1 ${focusRing}`,
);

/** Cream upload tile at the start of the prompt bar; turns amber on hover. */
export const stampNavPromptIconVariants = cva(
  "flex size-7 shrink-0 items-center justify-center rounded-lg bg-(--color-stamp-cream) text-(--color-stamp-chocolate) transition-colors duration-200 group-hover:bg-(--color-stamp-gold)/20 group-hover:text-(--color-stamp-gold-text) md:size-8",
);

/** "Stamp it!" label at the end of the prompt bar: no fill, amber on hover. */
export const stampNavPromptButtonVariants = cva(
  "ml-auto flex h-7 shrink-0 items-center rounded-lg px-3 text-xs font-bold uppercase tracking-wider text-(--color-stamp-chocolate) transition-colors duration-200 group-hover:text-(--color-stamp-gold-text) md:h-8 md:px-4",
);

/** Link in the header's category row: sentence case, amber underline on hover. */
export const stampNavCategoryLinkVariants = cva(
  `whitespace-nowrap rounded-md px-3 py-1.5 text-base font-medium text-(--color-stamp-chocolate) underline-offset-6 decoration-2 decoration-(--color-stamp-gold) transition-colors duration-200 hover:underline ${focusRing}`,
);

/** Text link in a footer column, on the cream footer. */
export const stampFooterLinkVariants = cva(
  "text-sm text-(--color-stamp-taupe) transition-colors hover:text-(--color-stamp-chocolate) hover:underline underline-offset-4 decoration-(--color-stamp-gold) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
);
