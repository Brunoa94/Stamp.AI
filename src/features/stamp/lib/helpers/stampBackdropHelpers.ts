import type { StampBackdropPhotoT } from "../types/stampTypes";

/** Index of the backdrop photo whose phase contains `step`: the last one starting at or before it. */
export function getStampBackdropIndex(
  step: number,
  photos: StampBackdropPhotoT[],
): number {
  const index = photos.findLastIndex((photo) => photo.fromStep <= step);
  return Math.max(0, index);
}

/**
 * Whether a backdrop photo is rendered: the active one and the phases on
 * either side, so moving forward or back still has both photos to
 * crossfade, while the photos further away aren't downloaded yet.
 */
export function isStampBackdropPhotoMounted(index: number, activeIndex: number): boolean {
  return Math.abs(index - activeIndex) <= 1;
}

/** The hero step (00) shows its own photo, so the canvas backdrop starts from step 01. */
export function isStampBackdropVisible(step: number): boolean {
  return step > 0;
}
