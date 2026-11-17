import { cva } from "class-variance-authority";

/**
 * Off-white-side colour of a SplitToneText (its photo-side colour and the
 * colours of a split live in STAMP_SPLIT_TONES): `title` for headings and
 * primary copy, `accent` for the serif title accent, `muted` for descriptions,
 * labels and hints, `faint` for small scale labels (the slider's Low/High).
 */
export const splitToneTextVariants = cva("", {
  variants: {
    tone: {
      title: "text-(--color-stamp-chocolate)",
      accent: "text-(--color-stamp-taupe)",
      muted: "text-(--color-stamp-taupe)",
      faint: "text-(--color-stamp-taupe)/40",
    },
  },
  defaultVariants: { tone: "title" },
});
