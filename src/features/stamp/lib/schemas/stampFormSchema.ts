import { z } from "zod";

/**
 * Stamp Form Schema
 *
 * Zod schema for form validation in the Stamp luxury flow.
 */

export const StampFormSchema = z.object({
  // Step tracking
  currentStep: z.number().min(0).max(8).optional(),

  // Upload
  uploadedFile: z.instanceof(File).optional(),
  uploadedImageUrl: z.string().optional(),

  // Synthesis inputs
  // `message` is an i18n key under the `validation` namespace, translated at
  // the form render site via next-intl (useTranslations).
  prompt: z
    .string()
    .max(500, "promptMax")
    .optional(),
  preservation: z.number().min(0).max(100).optional(),

  // Product selection
  productType: z.enum(["tshirt", "hoodie", "tote", "poster"]).optional(),
  fabricColor: z.string().optional(),
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]).optional(),

  // Generation state
  isGenerating: z.boolean().optional(),
  isFinalizing: z.boolean().optional(),
  generationProgress: z.number().min(0).max(100).optional(),
  productionProgress: z.number().min(0).max(100).optional(),

  // Generated results
  generatedResults: z
    .array(
      z.object({
        imageUrl: z.string(),
        enhancedPrompt: z.string(),
      }),
    )
    .optional(),

  // Selected image
  selectedImageUrl: z.string().optional(),
  enhancedPrompt: z.string().optional(),

  // Created product
  createdProductId: z.string().optional(),
  createdVariantId: z.number().optional(),
  mockupImageUrl: z.string().optional(),
});

export type StampFormDataType = z.infer<typeof StampFormSchema>;
