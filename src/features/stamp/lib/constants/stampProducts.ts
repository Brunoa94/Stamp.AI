import type { EditSuggestionType } from "../types/stampTypes";

/**
 * Stamp Product Configuration
 *
 * Product catalog for the luxury theme
 */

/**
 * Curated edit suggestions shown as a clickable image grid in the Synthesis
 * left panel. Selecting one seeds the prompt with its `prompt` text. Each
 * `image` is a photographic thumbnail under public/suggested-edits.
 */
export const STAMP_EDIT_SUGGESTIONS: EditSuggestionType[] = [
  {
    id: "vibrant",
    label: "Vibrant",
    hint: "Punchy saturated color",
    prompt: "Boost saturation for punchy, vivid color.",
    image: "/suggested-edits/vibrant.png",
  },
  {
    id: "monochrome",
    label: "Monochrome",
    hint: "Rich black & white",
    prompt: "Convert to a rich black-and-white treatment.",
    image: "/suggested-edits/monochrome.png",
  },
  {
    id: "vintage",
    label: "Vintage",
    hint: "Retro film look",
    prompt: "Apply a warm vintage, retro film look.",
    image: "/suggested-edits/vintage.png",
  },
  {
    id: "minimal",
    label: "Minimal",
    hint: "Clean & simple",
    prompt: "Simplify into a clean, minimalist composition.",
    image: "/suggested-edits/minimal.png",
  },
  {
    id: "watercolor",
    label: "Watercolor",
    hint: "Soft painted",
    prompt: "Reinterpret as a soft watercolor painting.",
    image: "/suggested-edits/watercolor.png",
  },
  {
    id: "line-art",
    label: "Line Art",
    hint: "Inked linework",
    prompt: "Render as clean inked line art.",
    image: "/suggested-edits/line-art.png",
  },
  {
    id: "pop-art",
    label: "Pop Art",
    hint: "Bold comic style",
    prompt: "Transform into bold pop-art with halftone dots.",
    image: "/suggested-edits/pop-art.png",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    hint: "Dramatic film light",
    prompt: "Grade with cinematic, dramatic film lighting.",
    image: "/suggested-edits/cinematic.png",
  },
  {
    id: "neon",
    label: "Neon",
    hint: "Glowing cyberpunk",
    prompt: "Bathe the composition in glowing neon, cyberpunk light.",
    image: "/suggested-edits/neon.png",
  },
  {
    id: "golden-hour",
    label: "Golden Hour",
    hint: "Warm directional light",
    prompt: "Bathe the composition in soft, golden-hour light.",
    image: "/suggested-edits/golden-hour.png",
  },
  {
    id: "high-contrast",
    label: "High Contrast",
    hint: "Bold shadows",
    prompt: "Push dramatic high-contrast shadows and bright highlights.",
    image: "/suggested-edits/high-contrast.png",
  },
  {
    id: "film-grain",
    label: "Film Grain",
    hint: "Analog texture",
    prompt: "Overlay subtle analog film grain and texture.",
    image: "/suggested-edits/film-grain.png",
  },
  {
    id: "oil-paint",
    label: "Oil Paint",
    hint: "Textured brushwork",
    prompt: "Reinterpret as a textured oil painting.",
    image: "/suggested-edits/oil-paint.png",
  },
  {
    id: "render-3d",
    label: "3D Render",
    hint: "Glossy dimensional",
    prompt: "Render as a glossy, dimensional 3D character.",
    image: "/suggested-edits/render-3d.png",
  },
  {
    id: "sketch",
    label: "Sketch",
    hint: "Pencil hand-drawn",
    prompt: "Render as a hand-drawn pencil sketch.",
    image: "/suggested-edits/sketch.png",
  },
];
