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
  { id: "vibrant", image: `${SUGGESTED_EDITS}/vibrant.png` },
  { id: "monochrome", image: `${SUGGESTED_EDITS}/monochrome.png` },
  { id: "vintage", image: `${SUGGESTED_EDITS}/vintage.png` },
  { id: "minimal", image: `${SUGGESTED_EDITS}/minimal.png` },
  { id: "watercolor", image: `${SUGGESTED_EDITS}/watercolor.png` },
  { id: "line-art", image: `${SUGGESTED_EDITS}/line-art.png` },
  { id: "pop-art", image: `${SUGGESTED_EDITS}/pop-art.png` },
  { id: "cinematic", image: `${SUGGESTED_EDITS}/cinematic.png` },
  { id: "neon", image: `${SUGGESTED_EDITS}/neon.png` },
  { id: "golden-hour", image: `${SUGGESTED_EDITS}/golden-hour.png` },
  { id: "high-contrast", image: `${SUGGESTED_EDITS}/high-contrast.png` },
  { id: "film-grain", image: `${SUGGESTED_EDITS}/film-grain.png` },
  { id: "oil-paint", image: `${SUGGESTED_EDITS}/oil-paint.png` },
  { id: "render-3d", image: `${SUGGESTED_EDITS}/render-3d.png` },
  { id: "sketch", image: `${SUGGESTED_EDITS}/sketch.png` },
];
