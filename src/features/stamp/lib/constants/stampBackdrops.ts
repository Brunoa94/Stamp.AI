import type { StampBackdropPhotoT } from "../types/stampTypes";

/**
 * Stamp canvas backdrop photos, one per step of the flow (00 hero has its own).
 * Each photo shows from `fromStep` until the next one starts;
 * moving to a new step crossfades to its photo.
 */
export const STAMP_BACKDROP_PHOTOS: StampBackdropPhotoT[] = [
  { src: "/backdrops/mug-window.jpg", fromStep: 0 }, // 01 upload
  { src: "/backdrops/hoodie-underground.jpg", fromStep: 2 }, // 02 synthesis
  { src: "/backdrops/kid-forest.jpg", fromStep: 3 }, // 03 generation
  { src: "/backdrops/hoodie-track.jpg", fromStep: 4 }, // 04 results
  { src: "/backdrops/coat-cathedral.jpg", fromStep: 5 }, // 05 product
  { src: "/backdrops/hoodie-gym.jpg", fromStep: 6 }, // 06 customize
  { src: "/backdrops/hoodie-milan.jpg", fromStep: 7 }, // 07 production
  { src: "/backdrops/canvas-living-room.jpg", fromStep: 8 }, // 08 review
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
