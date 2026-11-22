import { cva } from "class-variance-authority";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)";

/**
 * The fixed header bar. Below lg it is h-16 and fully transparent until the
 * page scrolls (or the drawer opens), then turns solid off-white; from lg it
 * keeps the h-24 bar with the frosted off-white once scrolled.
 */
export const stampHeaderVariants = cva(
  "fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b px-6 transition-all duration-300 lg:h-24 lg:px-12 xl:px-24",
  {
    variants: {
      solid: {
        true: "border-(--color-stamp-divider) bg-(--color-stamp-off-white) lg:bg-(--color-stamp-off-white)/80 lg:backdrop-blur-md",
        false: "border-transparent bg-transparent",
      },
    },
    defaultVariants: { solid: false },
  },
);

/**
 * Hamburger toggle below lg. Over the transparent header it sits on a dark
 * translucent pill, so it reads on both a photo and an off-white page.
 */
export const stampMenuButtonVariants = cva(
  "flex size-10 items-center justify-center rounded-full transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) focus-visible:ring-offset-2",
  {
    variants: {
      solid: {
        true: "-mr-2 text-(--color-stamp-chocolate)",
        false: "bg-(--color-stamp-chocolate)/70 text-(--color-stamp-white) backdrop-blur-sm",
      },
    },
    defaultVariants: { solid: false },
  },
);

/** Text link in the Stamp header nav and mobile drawer. */
export const stampNavLinkVariants = cva(
  "whitespace-nowrap font-semibold text-sm uppercase tracking-wider text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) transition-all duration-300",
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
 * "Sign up" trigger in the desktop header: the solid gold primary action. The
 * auth dialog renders it as an unstyled Button, whose `outline-none` would
 * cancel an outline, so its focus indicator is a ring.
 */
export const stampNavSignUpVariants = cva(
  "inline-flex h-10 items-center whitespace-nowrap rounded-md bg-(--color-stamp-gold) px-5 text-sm font-semibold uppercase tracking-wider text-(--color-stamp-chocolate) shadow-sm transition-colors duration-300 hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white) active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) focus-visible:ring-offset-2",
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
