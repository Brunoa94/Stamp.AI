import type { EditSuggestionType } from "../types/stampTypes";

/**
 * Stamp Product Configuration
 *
 * Product catalog for the luxury theme
 */

/**
 * Curated edit suggestions shown as a clickable image grid in the Synthesis
 * left panel. Selecting one seeds the prompt with its `prompt` text. Each
 * `image` is a representative thumbnail under public/assets/edit-suggestions.
 */
export const STAMP_EDIT_SUGGESTIONS: EditSuggestionType[] = [
  {
    id: "enhance-detail",
    label: "Enhance Detail",
    hint: "Sharpen fine line work",
    prompt: "Sharpen the fine details and enhance intricate line work.",
    image: "/assets/edit-suggestions/enhance-detail.svg",
  },
  {
    id: "warm-palette",
    label: "Warm Palette",
    hint: "Ochre & terracotta",
    prompt: "Shift to a warm, earthy palette of ochre and terracotta.",
    image: "/assets/edit-suggestions/warm-palette.svg",
  },
  {
    id: "golden-hour",
    label: "Golden Hour",
    hint: "Soft, directional light",
    prompt: "Bathe the composition in soft, golden-hour light.",
    image: "/assets/edit-suggestions/golden-hour.svg",
  },
  {
    id: "high-contrast",
    label: "High Contrast",
    hint: "Dramatic shadows",
    prompt: "Push dramatic high-contrast shadows and bright highlights.",
    image: "/assets/edit-suggestions/high-contrast.svg",
  },
  {
    id: "gilded-accents",
    label: "Gilded Accents",
    hint: "Gold-foil highlights",
    prompt: "Add delicate gilded, gold-foil accents to key details.",
    image: "/assets/edit-suggestions/gilded-accents.svg",
  },
  {
    id: "soft-focus",
    label: "Soft Focus",
    hint: "Dreamy atmosphere",
    prompt: "Soften the edges with a dreamy, atmospheric focus.",
    image: "/assets/edit-suggestions/soft-focus.svg",
  },
  {
    id: "layered-depth",
    label: "Layered Depth",
    hint: "Foreground separation",
    prompt:
      "Build layered depth with clear foreground and background separation.",
    image: "/assets/edit-suggestions/layered-depth.svg",
  },
  {
    id: "editorial-crop",
    label: "Editorial Crop",
    hint: "Bold off-center frame",
    prompt: "Reframe with a bold, editorial off-center crop.",
    image: "/assets/edit-suggestions/editorial-crop.svg",
  },
  {
    id: "film-grain",
    label: "Film Grain",
    hint: "Vintage texture",
    prompt: "Overlay subtle vintage film grain and analog texture.",
    image: "/assets/edit-suggestions/film-grain.svg",
  },
];
