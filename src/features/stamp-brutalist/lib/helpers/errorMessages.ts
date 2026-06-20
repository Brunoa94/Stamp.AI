/**
 * User-facing error messages for Stamp Brutalist feature
 * Maps internal error types to user-friendly messages
 */

/**
 * Maps internal error types to user-friendly messages
 */
export const STAMP_ERROR_MESSAGES = {
  INVALID_STEP: "Invalid step number. Please navigate using the sidebar.",
  MISSING_IMAGE_URL: "Image URL is required to proceed.",
  MISSING_PROMPT: "Please enter a prompt to generate images.",
  MISSING_PRODUCT_SELECTION: "Please select a product type to continue.",
  MISSING_COLOR_SIZE: "Please select both a color and size.",
  GENERATION_FAILED: "Image generation failed. Please try again.",
  PRODUCT_CREATION_FAILED: "Failed to create product. Please try again.",
  ADD_TO_CART_FAILED: "Failed to add product to cart. Please try again.",
  INVALID_GENERATED_RESULT: "Invalid generation result format.",
  STORE_NOT_AVAILABLE:
    "Stamp flow store is not available. Please refresh the page.",
} as const;

export type StampErrorMessageKey = keyof typeof STAMP_ERROR_MESSAGES;

/**
 * Gets a user-friendly error message
 * @param key - The error message key
 * @returns The user-friendly error message
 */
export function getStampErrorMessage(key: StampErrorMessageKey): string {
  return STAMP_ERROR_MESSAGES[key];
}
