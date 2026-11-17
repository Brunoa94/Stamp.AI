import { cva } from "class-variance-authority";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)";

/**
 * Floating pill that holds the header. Transparent over the hero, then
 * fills in as a frosted-glass capsule once the page scrolls or the mobile
 * menu opens. Only paint properties transition, so crossing the scroll
 * threshold never triggers layout.
 */
export const stampHeaderShellVariants = cva(
  "mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border py-2 pl-3 pr-2 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out",
  {
    variants: {
      elevated: {
        true: "border-(--color-stamp-divider) bg-(--color-stamp-off-white)/75 shadow-lg shadow-(--color-stamp-chocolate)/5 backdrop-blur-xl backdrop-saturate-150",
        false: "border-transparent bg-transparent",
      },
    },
    defaultVariants: { elevated: false },
  },
);

/** Text link in the desktop header nav; the active route gets a soft pill. */
export const stampNavLinkVariants = cva(
  `relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${focusRing}`,
  {
    variants: {
      active: {
        true: "bg-(--color-stamp-chocolate)/[0.06] text-(--color-stamp-chocolate)",
        false:
          "text-(--color-stamp-taupe) hover:bg-(--color-stamp-chocolate)/[0.04] hover:text-(--color-stamp-chocolate)",
      },
    },
    defaultVariants: { active: false },
  },
);

/** Round icon control in the header (bag, profile, logout, menu toggle). */
export const stampNavIconButtonVariants = cva(
  `relative inline-flex size-10 items-center justify-center rounded-full text-(--color-stamp-chocolate) transition-colors duration-200 hover:bg-(--color-stamp-chocolate)/[0.06] disabled:opacity-50 ${focusRing}`,
);

/** Item-count bubble pinned to the bag icon. */
export const stampNavBadgeVariants = cva(
  "pointer-events-none absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-(--color-stamp-gold) px-1 text-[10px] font-bold leading-none text-(--color-stamp-chocolate) ring-2 ring-(--color-stamp-off-white)",
);

/** "Stamp it!" primary action: a solid chocolate pill with a sliding arrow. */
export const stampNavCtaVariants = cva(
  `group inline-flex items-center justify-center gap-1.5 rounded-full bg-(--color-stamp-chocolate) font-semibold text-(--color-stamp-white) shadow-sm transition-all duration-300 hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) hover:shadow-md active:scale-[0.98] ${focusRing}`,
  {
    variants: {
      size: {
        default: "h-10 px-5 text-sm",
        lg: "h-12 w-full px-6 text-base",
      },
    },
    defaultVariants: { size: "default" },
  },
);

/** Sign-in / sign-up text trigger in the header. */
export const stampNavAuthLinkVariants = cva(
  `rounded-full text-sm font-medium transition-colors duration-200 ${focusRing}`,
  {
    variants: {
      emphasis: {
        quiet:
          "px-3 py-2 text-(--color-stamp-taupe) hover:text-(--color-stamp-chocolate)",
        outline:
          "h-12 w-full border border-(--color-stamp-divider) px-6 text-(--color-stamp-chocolate) hover:border-(--color-stamp-chocolate)/30",
      },
    },
    defaultVariants: { emphasis: "quiet" },
  },
);

/**
 * Mobile menu card; hidden copies stay out of the tab order and a11y tree.
 * Capped to the viewport below the header and scrollable, so every item stays
 * reachable at high zoom.
 */
export const stampMobileMenuVariants = cva(
  "fixed inset-x-4 top-24 z-40 max-h-[calc(100dvh-7rem)] origin-top overflow-y-auto overscroll-contain rounded-3xl border border-(--color-stamp-divider) bg-(--color-stamp-off-white)/95 p-3 shadow-xl shadow-(--color-stamp-chocolate)/10 backdrop-blur-xl transition-all duration-300 ease-out lg:hidden",
  {
    variants: {
      open: {
        true: "visible translate-y-0 scale-100 opacity-100",
        false: "pointer-events-none invisible -translate-y-2 scale-95 opacity-0",
      },
    },
    defaultVariants: { open: false },
  },
);

/** Large link row inside the mobile menu. */
export const stampMobileNavLinkVariants = cva(
  `flex items-center justify-between rounded-2xl px-4 py-3.5 font-heading text-2xl transition-colors duration-200 ${focusRing}`,
  {
    variants: {
      active: {
        true: "bg-(--color-stamp-chocolate)/[0.06] text-(--color-stamp-chocolate)",
        false:
          "text-(--color-stamp-chocolate)/80 hover:bg-(--color-stamp-chocolate)/[0.04] hover:text-(--color-stamp-chocolate)",
      },
    },
    defaultVariants: { active: false },
  },
);

/** Text link in a footer column. */
export const stampFooterLinkVariants = cva(
  "text-xs font-semibold uppercase tracking-[0.15em] text-(--color-stamp-taupe) transition-colors hover:text-(--color-stamp-gold) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)",
);
