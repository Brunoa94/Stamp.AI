/**
 * Validation utilities for Stamp Brutalist feature
 * Provides validation functions for steps, results, and URLs
 */

import type { GeneratedResultTypes } from "../types/stampFlowTypes";

/**
 * Validates if a step number is within valid range
 * @param step - The step number to validate
 * @param totalSteps - Total number of steps (default: 8)
 * @returns {boolean} True if step is valid
 */
export function isValidStep(step: number, totalSteps: number = 8): boolean {
  return typeof step === "number" && step >= 1 && step <= totalSteps;
}

/**
 * Validates a generated result object
 * @param result - The result object to validate
 * @returns {boolean} True if result has required properties
 */
export function isValidGeneratedResult(
  result: unknown,
): result is GeneratedResultTypes {
  if (typeof result !== "object" || result === null) {
    return false;
  }

  const typed = result as Partial<GeneratedResultTypes>;
  return (
    typeof typed.imageUrl === "string" &&
    typed.imageUrl.length > 0 &&
    typeof typed.enhancedPrompt === "string"
  );
}

/**
 * Validates a URL string
 * @param url - The URL to validate
 * @returns {boolean} True if URL is valid
 */
export function isValidUrl(url: unknown): url is string {
  if (typeof url !== "string" || url.length === 0) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative URL or data URL
    return url.startsWith("/") || url.startsWith("data:");
  }
}

/**
 * Validates form selections for product creation
 * @param formData - The stamp form data
 * @param selectedImageUrl - The selected image URL
 * @returns {boolean} True if all required selections are present
 */
export function isValidProductSelections(
  formData: { selectedColor?: string; selectedSize?: string; blueprintId?: number; printProviderId?: number },
  selectedImageUrl: string | undefined,
): boolean {
  // Check color, size, and image
  if (!formData.selectedColor || !formData.selectedSize || !selectedImageUrl) {
    return false;
  }

  // Check blueprint and provider
  if (!formData.blueprintId || !formData.printProviderId) {
    return false;
  }

  return true;
}

/**
 * Validates user authentication data
 * @param user - The user object to validate
 * @returns {boolean} True if user has required authentication data
 */
export function isValidAuthenticatedUser(
  user: { id?: string; email?: string } | undefined | null,
): user is { id: string; email: string } {
  return !!user?.id && !!user?.email;
}
