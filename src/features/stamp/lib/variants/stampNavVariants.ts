import { cva } from "class-variance-authority";

/** Text link in the Stamp header nav and mobile drawer. */
export const stampNavLinkVariants = cva(
  "font-semibold text-sm uppercase tracking-wider text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold) transition-all duration-300",
);

/** "Start stamping" CTA; mirrors the hero upload card so it reads as the same action. */
export const stampNavCtaVariants = cva(
  "group inline-flex items-center justify-center rounded-lg border-3 border-dashed border-(--color-stamp-gold) bg-(--color-stamp-gold)/10 text-lg leading-none font-bold uppercase tracking-wider text-(--color-stamp-chocolate) shadow-lg ring-4 ring-(--color-stamp-gold)/20 transition-all duration-300 animate-stamp-press hover:animate-none hover:-translate-y-0.5 hover:border-solid hover:bg-(--color-stamp-white) hover:shadow-xl hover:ring-(--color-stamp-gold)/35 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-(--color-stamp-gold)/50",
);

/** Text link in a footer column. */
export const stampFooterLinkVariants = cva(
  "text-xs font-semibold uppercase tracking-[0.15em] text-(--color-stamp-taupe) transition-colors hover:text-(--color-stamp-gold) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)",
);
