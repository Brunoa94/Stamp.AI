import { cva } from "class-variance-authority";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)";

/** Text link in the Stamp header nav and mobile drawer. */
export const stampNavLinkVariants = cva(
  "font-semibold text-sm uppercase tracking-wider text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) transition-all duration-300",
);

/**
 * Desktop header link with a leading icon. `iconOnly` makes it a round icon
 * button (the bag), whose name then comes from its aria-label.
 */
export const stampNavIconLinkVariants = cva(
  `group relative inline-flex items-center rounded-md text-(--color-stamp-chocolate) transition-colors duration-300 hover:text-(--color-stamp-gold) ${focusRing}`,
  {
    variants: {
      iconOnly: {
        true: "size-10 justify-center hover:bg-(--color-stamp-chocolate)/5",
        false: "gap-2 py-2 text-sm font-semibold uppercase tracking-wider",
      },
    },
    defaultVariants: { iconOnly: false },
  },
);

/**
 * "Sign up" trigger in the desktop header: the solid gold primary action. The
 * auth dialog renders it as an unstyled Button, whose `outline-none` would
 * cancel an outline, so its focus indicator is a ring.
 */
export const stampNavSignUpVariants = cva(
  "inline-flex h-10 items-center rounded-md bg-(--color-stamp-gold) px-5 text-sm font-semibold uppercase tracking-wider text-(--color-stamp-chocolate) shadow-sm transition-colors duration-300 hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) focus-visible:ring-offset-2",
);

/**
 * Label bubble under a header link that shows only its icon. It appears on
 * hover and on keyboard focus (a `title` would only show on hover). `compact`
 * links show their own label from `xl`, so the bubble stops there.
 */
export const stampNavTooltipVariants = cva(
  "pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-(--color-stamp-chocolate) px-2 py-1 text-xs font-semibold normal-case tracking-normal text-(--color-stamp-white) opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
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

/** "Start stamping" CTA; mirrors the hero upload card so it reads as the same action. */
export const stampNavCtaVariants = cva(
  "group inline-flex items-center justify-center rounded-lg border-3 border-dashed border-(--color-stamp-gold) bg-(--color-stamp-gold)/10 text-lg leading-none font-bold uppercase tracking-wider text-(--color-stamp-chocolate) shadow-lg ring-4 ring-(--color-stamp-gold)/20 transition-all duration-300 animate-stamp-press hover:animate-none hover:-translate-y-0.5 hover:border-solid hover:bg-(--color-stamp-white) hover:shadow-xl hover:ring-(--color-stamp-gold)/35 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-(--color-stamp-gold)/50",
);

/** Text link in a footer column. */
export const stampFooterLinkVariants = cva(
  "text-xs font-semibold uppercase tracking-[0.15em] text-(--color-stamp-taupe) transition-colors hover:text-(--color-stamp-gold) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)",
);
