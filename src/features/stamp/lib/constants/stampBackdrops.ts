import type { StampBackdropPhotoT } from "../types/stampTypes";

/**
 * Stamp canvas backdrop photos, one per phase of the flow.
 * Each photo shows from `fromStep` until the next one's phase starts;
 * moving into a new phase crossfades to its photo.
 */
export const STAMP_BACKDROP_PHOTOS: StampBackdropPhotoT[] = [
  { src: "/home/hero-backdrop.jpg", fromStep: 0 }, // 01 upload (same photo as the homepage hero; 00 hero has its own)
  { src: "/backdrops/mug-window.jpg", fromStep: 2 }, // 02 synthesis, 03 generation
  { src: "/backdrops/kid-forest.jpg", fromStep: 4 }, // 04 results, 05 product
  { src: "/backdrops/coat-cathedral.jpg", fromStep: 6 }, // 06 customize, 07 production, 08 review
];

/**
 * Where the canvas backdrop's diagonal edge sits from md up, as fractions of
 * the viewport width at the top and bottom of the canvas (below the 96px
 * header). Keep in sync with `.stamp-backdrop__photo` in globals.css.
 */
export const STAMP_BACKDROP_EDGE = {
  topX: 0.7,
  bottomX: 0.6,
  canvasTopPx: 96,
  minViewportWidthPx: 768,
};

/**
 * Colours of SplitToneText per tone: `base` on the off-white (md+), `photo`
 * on the backdrop photo. Contrast on the photo, worst spot over all photos at
 * 1280/1440/1920: off-white 6.0:1, cream 5.6:1, gold-light 3.96:1 (large
 * title accent only, needs 3:1).
 */
export const STAMP_SPLIT_TONES = {
  title: { base: "var(--color-stamp-chocolate)", photo: "var(--color-stamp-off-white)" },
  accent: { base: "var(--color-stamp-taupe)", photo: "var(--color-stamp-gold-light)" },
  muted: { base: "var(--color-stamp-taupe)", photo: "var(--color-stamp-cream)" },
} as const;
