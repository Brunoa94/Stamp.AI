/**
 * Image Generation Constants
 *
 * Configuration for the Stamp AI image generation flow (Step 3).
 */

/** Hard timeout for a single AI generation request. */
export const IMAGE_GENERATION_TIMEOUT_MS = 90_000; // 90 seconds

/**
 * Art-style selection was removed from the UI; the generation API still
 * accepts a style, so we send a sensible default.
 */
export const DEFAULT_SYNTHESIS_STYLE = "editorial";
