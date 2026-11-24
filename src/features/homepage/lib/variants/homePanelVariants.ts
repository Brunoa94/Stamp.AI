import { cva } from "class-variance-authority";

/**
 * Rounded-2xl panel inside the page gutter for the homepage story and promo
 * sections (same shape as the CTA and product-of-the-month panels): chocolate
 * for strong moments, cream for alternate bands, white with a hairline border.
 */
export const homePanelVariants = cva(
  "relative mx-auto max-w-screen-2xl overflow-hidden rounded-2xl px-6 py-12 sm:px-10 lg:px-16 lg:py-16",
  {
    variants: {
      tone: {
        chocolate: "bg-(--color-stamp-chocolate)",
        cream: "bg-(--color-stamp-cream)",
        white: "border border-(--color-stamp-divider) bg-(--color-stamp-white)",
      },
    },
    defaultVariants: { tone: "cream" },
  },
);
