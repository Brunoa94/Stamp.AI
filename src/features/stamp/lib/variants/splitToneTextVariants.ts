import { cva } from "class-variance-authority";

/**
 * Off-white-side colour of a SplitToneText (its photo-side colour and the
 * colours of a split live in STAMP_SPLIT_TONES): `title` for headings and
 * primary copy, `accent` for the handwritten title accent (amber text, per the
 * Stamp look), `muted` for descriptions, labels and hints, `faint` for small
 * scale labels.
 */
export const splitToneTextVariants = cva("", {
  variants: {
    tone: {
      title: "text-(--color-stamp-chocolate)",
      accent: "text-(--color-stamp-gold-text)",
      muted: "text-(--color-stamp-taupe)",
      faint: "text-(--color-stamp-taupe)/40",
    },
  },
  defaultVariants: { tone: "title" },
});
