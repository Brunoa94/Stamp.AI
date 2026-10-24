import { cva } from "class-variance-authority";

/**
 * Tones for FlowMockButton. The scripted "user" presses a button by
 * switching its tone, so `transition-colors` lives in the base.
 */
export const flowMockButtonVariants = cva(
  "flex h-11 items-center justify-center gap-2 rounded-xs px-3 text-2xs font-bold uppercase tracking-ultra transition-colors duration-300",
  {
    variants: {
      tone: {
        dark: "bg-(--color-stamp-chocolate) text-(--color-stamp-white)",
        gold: "bg-(--color-stamp-gold) text-(--color-stamp-chocolate)",
        muted: "bg-(--color-stamp-chocolate)/40 text-(--color-stamp-white)",
        pressed: "bg-(--color-stamp-chocolate)/80 text-(--color-stamp-white)",
        outline:
          "border border-(--color-stamp-chocolate)/15 bg-(--color-stamp-white) text-(--color-stamp-chocolate)",
      },
    },
  },
);
