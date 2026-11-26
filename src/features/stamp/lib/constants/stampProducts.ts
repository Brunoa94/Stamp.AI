import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";
import type { EditSuggestionType } from "../types/stampTypes";

const SUGGESTED_EDITS = staticAssetUrl("/suggested-edits");

/**
 * Stamp Product Configuration
 *
 * Product catalog for the luxury theme
 */

/**
 * Curated edit suggestions shown as a clickable image grid in the Synthesis
 * left panel. Display strings (label, hint, prompt) are translated — see
 * `stamp.suggestions.<id>` in the message catalog. Each `image` is a
 * photographic thumbnail under suggested-edits/ on the static-assets CDN.
 */
export const STAMP_EDIT_SUGGESTIONS: EditSuggestionType[] = [
  { id: "vibrant", image: `${SUGGESTED_EDITS}/vibrant.webp` },
  { id: "monochrome", image: `${SUGGESTED_EDITS}/monochrome.webp` },
  { id: "vintage", image: `${SUGGESTED_EDITS}/vintage.webp` },
  { id: "minimal", image: `${SUGGESTED_EDITS}/minimal.webp` },
  { id: "watercolor", image: `${SUGGESTED_EDITS}/watercolor.webp` },
  { id: "line-art", image: `${SUGGESTED_EDITS}/line-art.webp` },
  { id: "pop-art", image: `${SUGGESTED_EDITS}/pop-art.webp` },
  { id: "cinematic", image: `${SUGGESTED_EDITS}/cinematic.webp` },
  { id: "neon", image: `${SUGGESTED_EDITS}/neon.webp` },
  { id: "golden-hour", image: `${SUGGESTED_EDITS}/golden-hour.webp` },
  { id: "high-contrast", image: `${SUGGESTED_EDITS}/high-contrast.webp` },
  { id: "film-grain", image: `${SUGGESTED_EDITS}/film-grain.webp` },
  { id: "oil-paint", image: `${SUGGESTED_EDITS}/oil-paint.webp` },
  { id: "render-3d", image: `${SUGGESTED_EDITS}/render-3d.webp` },
  { id: "sketch", image: `${SUGGESTED_EDITS}/sketch.webp` },
];
