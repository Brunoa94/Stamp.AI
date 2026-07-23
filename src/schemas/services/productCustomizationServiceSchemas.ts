import { z } from "zod";

/**
 * Product Customization Service Schemas
 * Validation schemas for product customization API requests and responses
 *
 * Note: VariantInfoSchema and BlueprintVariantsResponseSchema are already
 * defined in src/schemas/printify.ts - reuse those instead
 */

/**
 * Schema for print area information
 */
const PrintAreaSchema = z.object({
  position: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
});

/**
 * Schema for catalog blueprint
 */
const CatalogBlueprintSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  brand: z.string(),
  model: z.string(),
  images: z.array(z.string().url()),
  printAreas: z.array(PrintAreaSchema),
});

/**
 * Schema for catalog blueprints response
 * Used by productCustomizationService for Edge Function responses
 */
export const CatalogBlueprintsResponseSchema = z.object({
  success: z.boolean(),
  blueprints: z.array(CatalogBlueprintSchema),
  printProviderId: z.number().int().positive(),
  error: z.string().optional(),
});
