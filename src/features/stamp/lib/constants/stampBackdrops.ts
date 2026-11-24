import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";
import type { StampBackdropPhotoT } from "../types/stampTypes";

const BACKDROPS = staticAssetUrl("/backdrops");

/**
 * Stamp canvas backdrop photos, one per step of the flow (00 hero has its own).
 * Each photo shows from `fromStep` until the next one starts;
 * moving to a new step crossfades to its photo. From lg only the slice
 * right of the edge shows, so `focus` keeps the photo's customized product
 * inside that slice.
 */
export const STAMP_BACKDROP_PHOTOS: StampBackdropPhotoT[] = [
  { src: `${BACKDROPS}/mug-window.jpg`, fromStep: 0, focus: "65% 0%" }, // 01 upload: the mug
  { src: `${BACKDROPS}/hoodie-underground.jpg`, fromStep: 2, focus: "45% 0%" }, // 02 synthesis: the hoodie print
  { src: `${BACKDROPS}/kid-forest.jpg`, fromStep: 3, focus: "54% 0%" }, // 03 generation: the dino tee
  { src: `${BACKDROPS}/hoodie-track.jpg`, fromStep: 4, focus: "62% 0%" }, // 04 results: the hoodie logo
  { src: `${BACKDROPS}/coat-cathedral.jpg`, fromStep: 5, focus: "78% 0%" }, // 05 product: the tote
  { src: `${BACKDROPS}/hoodie-gym.jpg`, fromStep: 6, focus: "50% 0%" }, // 06 customize: the back print
  { src: `${BACKDROPS}/hoodie-milan.jpg`, fromStep: 7, focus: "48% 0%" }, // 07 production: the tiger print
  { src: `${BACKDROPS}/canvas-living-room.jpg`, fromStep: 8, focus: "64% 0%" }, // 08 review: the canvas
];

/**
 * Where the canvas backdrop's diagonal edge sits from md up, at the top and
 * bottom of the canvas (below the 96px header). From md it runs from 70% to
 * 60% of the viewport width; from lg it starts on the steps sidebar's left
 * border and slants `slant` of the viewport width to the left by the bottom.
 * Keep in sync with `.stamp-backdrop__photo` in globals.css.
 */
export const STAMP_BACKDROP_EDGE = {
  topX: 0.7,
  bottomX: 0.6,
  canvasTopPx: 96,
  minViewportWidthPx: 768,
  sidebarWidthPx: 17 * 15, // sidebar w-68 (17rem) at the 15px root font size (globals.css html)
  sidebarMinViewportWidthPx: 1024,
  slant: 0.1,
};

/**
 * Colours of SplitToneText per tone: `base` on the off-white (md+), `photo`
 * on the backdrop photo. Contrast on the photo, worst spot over all photos at
 * 1280/1440/1920: off-white 6.0:1, cream 5.6:1, gold-light 3.96:1 (large
 * title accent only, needs 3:1).
 */
export const STAMP_SPLIT_TONES = {
  title: { base: "var(--color-stamp-chocolate)", photo: "var(--color-stamp-off-white)" },
  accent: { base: "var(--color-stamp-gold-text)", photo: "var(--color-stamp-gold-light)" },
  muted: { base: "var(--color-stamp-taupe)", photo: "var(--color-stamp-cream)" },
  faint: {
    base: "color-mix(in srgb, var(--color-stamp-taupe) 40%, transparent)",
    photo: "var(--color-stamp-white)",
  },
} as const;
