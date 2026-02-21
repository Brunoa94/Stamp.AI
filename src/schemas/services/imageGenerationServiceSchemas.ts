import { z } from "zod";

/**
 * Image Generation Service Schemas
 * Validation schemas for image generation API requests and responses
 */

/**
 * Schema for image generation API request
 */
export const ImageGenerationRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  image: z.instanceof(File, { message: "Image file is required" }),
});

/**
 * Schema for image generation API response
 */
export const ImageGenerationResponseSchema = z.object({
  success: z.boolean(),
  imageUrl: z.string().url("Image URL must be a valid URL"),
  enhancedPrompt: z.string(),
  originalPrompt: z.string(),
});

/**
 * Schema for image generation result
 */
export const ImageGenerationResultSchema = z.object({
  imageUrl: z.string().url("Image URL must be a valid URL"),
  enhancedPrompt: z.string(),
  originalPrompt: z.string(),
});
