import type { EditSuggestionType } from "../types/stampTypes";

/**
 * Stamp Product Configuration
 *
 * Product catalog for the luxury theme
 */

/**
 * Curated edit suggestions shown as a clickable image grid in the Synthesis
 * left panel. Selecting one seeds the prompt with its `prompt` text. Each
 * `image` is a photographic thumbnail under public/assets/edit-suggestions.
 */
export const STAMP_EDIT_SUGGESTIONS: EditSuggestionType[] = [
  {
    id: "vibrant",
    label: "Vibrant",
    hint: "Punchy saturated color",
    prompt: "Boost saturation for punchy, vivid color.",
    image: "/assets/edit-suggestions/vibrant.png",
  },
  {
    id: "monochrome",
    label: "Monochrome",
    hint: "Rich black & white",
    prompt: "Convert to a rich black-and-white treatment.",
    image: "/assets/edit-suggestions/monochrome.png",
  },
  {
    id: "vintage",
    label: "Vintage",
    hint: "Retro film look",
    prompt: "Apply a warm vintage, retro film look.",
    image: "/assets/edit-suggestions/vintage.png",
  },
  {
    id: "minimal",
    label: "Minimal",
    hint: "Clean & simple",
    prompt: "Simplify into a clean, minimalist composition.",
    image: "/assets/edit-suggestions/minimal.png",
  },
  {
    id: "watercolor",
    label: "Watercolor",
    hint: "Soft painted",
    prompt: "Reinterpret as a soft watercolor painting.",
    image: "/assets/edit-suggestions/watercolor.png",
  },
  {
    id: "line-art",
    label: "Line Art",
    hint: "Inked linework",
    prompt: "Render as clean inked line art.",
    image: "/assets/edit-suggestions/line-art.png",
  },
  {
    id: "pop-art",
    label: "Pop Art",
    hint: "Bold comic style",
    prompt: "Transform into bold pop-art with halftone dots.",
    image: "/assets/edit-suggestions/pop-art.png",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    hint: "Dramatic film light",
    prompt: "Grade with cinematic, dramatic film lighting.",
    image: "/assets/edit-suggestions/cinematic.png",
  },
  {
    id: "neon",
    label: "Neon",
    hint: "Glowing cyberpunk",
    prompt: "Bathe the composition in glowing neon, cyberpunk light.",
    image: "/assets/edit-suggestions/neon.png",
  },
  {
    id: "golden-hour",
    label: "Golden Hour",
    hint: "Warm directional light",
    prompt: "Bathe the composition in soft, golden-hour light.",
    image: "/assets/edit-suggestions/golden-hour.png",
  },
  {
    id: "high-contrast",
    label: "High Contrast",
    hint: "Bold shadows",
    prompt: "Push dramatic high-contrast shadows and bright highlights.",
    image: "/assets/edit-suggestions/high-contrast.png",
  },
  {
    id: "film-grain",
    label: "Film Grain",
    hint: "Analog texture",
    prompt: "Overlay subtle analog film grain and texture.",
    image: "/assets/edit-suggestions/film-grain.png",
  },
  {
    id: "oil-paint",
    label: "Oil Paint",
    hint: "Textured brushwork",
    prompt: "Reinterpret as a textured oil painting.",
    image: "/assets/edit-suggestions/oil-paint.png",
  },
  {
    id: "render-3d",
    label: "3D Render",
    hint: "Glossy dimensional",
    prompt: "Render as a glossy, dimensional 3D character.",
    image: "/assets/edit-suggestions/render-3d.png",
  },
  {
    id: "sketch",
    label: "Sketch",
    hint: "Pencil hand-drawn",
    prompt: "Render as a hand-drawn pencil sketch.",
    image: "/assets/edit-suggestions/sketch.png",
  },
];
