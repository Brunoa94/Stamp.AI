import type { EditSuggestionType } from "../types/stampTypes";

/**
 * Stamp Product Configuration
 *
 * Product catalog for the luxury theme
 */

/**
 * Curated edit suggestions shown as a clickable image grid in the Synthesis
 * left panel. Display strings (label, hint, prompt) are translated — see
 * `stamp.suggestions.<id>` in the message catalog. Each `image` is a
 * photographic thumbnail under public/suggested-edits.
 */
export const STAMP_EDIT_SUGGESTIONS: EditSuggestionType[] = [
  { id: "vibrant", image: "/suggested-edits/vibrant.png" },
  { id: "monochrome", image: "/suggested-edits/monochrome.png" },
  { id: "vintage", image: "/suggested-edits/vintage.png" },
  { id: "minimal", image: "/suggested-edits/minimal.png" },
  { id: "watercolor", image: "/suggested-edits/watercolor.png" },
  { id: "line-art", image: "/suggested-edits/line-art.png" },
  { id: "pop-art", image: "/suggested-edits/pop-art.png" },
  { id: "cinematic", image: "/suggested-edits/cinematic.png" },
  { id: "neon", image: "/suggested-edits/neon.png" },
  { id: "golden-hour", image: "/suggested-edits/golden-hour.png" },
  { id: "high-contrast", image: "/suggested-edits/high-contrast.png" },
  { id: "film-grain", image: "/suggested-edits/film-grain.png" },
  { id: "oil-paint", image: "/suggested-edits/oil-paint.png" },
  { id: "render-3d", image: "/suggested-edits/render-3d.png" },
  { id: "sketch", image: "/suggested-edits/sketch.png" },
];
