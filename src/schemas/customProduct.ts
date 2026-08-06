import { z } from "zod";

/**
 * Placement of a design within a print area (Printify semantics):
 * x/y = design center (0-1), scale = width relative to print-area width.
 */
export const PlacementParamsSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  scale: z.number().min(0.1).max(2),
  angle: z.number(),
});

/**
 * A user-selected print position with its placement.
 */
export const PrintPositionSchema = z.object({
  position: z.string().min(1),
  placement: PlacementParamsSchema,
});

/**
 * Schema for creating a custom product
 */
export const CreateProductPayloadSchema = z.object({
  blueprint_id: z.number().int().positive("Blueprint ID must be a positive integer"),
  print_provider_id: z.number().int().positive("Print provider ID must be a positive integer"),
  image_url: z.string().min(1, "Image URL is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  user_id: z.string().uuid("User ID must be a valid UUID"),
  customer_email: z.string().email("Customer email must be a valid email"),
  selected_color: z.string().nullable().optional(),
  selected_size: z.string().nullable().optional(),
  // Optional user-adjusted print positions (Step 6 design adjustment).
  // When omitted the server falls back to auto-placement on the front.
  print_positions: z.array(PrintPositionSchema).optional(),
});

/**
 * Schema for product variant
 * Note: price must be an integer representing cents (e.g., 2999 = $29.99)
 */
const ProductVariantSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number().int(), // Price in cents (must be integer)
  is_enabled: z.boolean(),
});

/**
 * Schema for product image
 */
const ProductImageSchema = z.object({
  src: z.string(),
  position: z.string(),
  is_default: z.boolean(),
});

/**
 * Schema for created product response
 */
export const CreatedProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  variants: z.array(ProductVariantSchema),
  images: z.array(ProductImageSchema).optional(),
  uploaded_image_preview_url: z.string().url().optional(),
});

/**
 * Schema for upload image request
 */
export const UploadImageRequestSchema = z.object({
  image_url: z.string().url("Image URL must be a valid URL").optional(),
  image_base64: z.string().min(1, "Image base64 is required").optional(),
  file_name: z.string().min(1, "File name is required"),
}).refine(
  (data) => Boolean(data.image_url || data.image_base64),
  {
    message: "Either image_url or image_base64 is required",
    path: ["image_url"],
  },
);

/**
 * Schema for upload image response
 */
export const UploadImageResponseSchema = z.object({
  success: z.boolean(),
  image: z.object({
    id: z.string(),
    file_name: z.string(),
    height: z.number(),
    width: z.number(),
    size: z.number(),
    mime_type: z.string(),
    preview_url: z.string(),
  }),
});

/**
 * Schema for create custom product request to Edge Function
 */
export const CreateCustomProductRequestSchema = z.object({
  blueprint_id: z.number(),
  print_provider_id: z.number(),
  // Position -> uploaded Printify image id. At least one entry required.
  print_areas: z
    .record(z.string(), z.string())
    .refine((areas) => Object.keys(areas).length > 0, {
      message: "At least one print area is required",
    }),
  // Optional per-position placements chosen by the user; positions without
  // an entry get server-side auto-placement.
  placements: z.record(z.string(), PlacementParamsSchema).optional(),
  title: z.string(),
  description: z.string(),
  user_id: z.string(),
  customer_email: z.string(),
  selected_color: z.string().nullable().optional(),
  selected_size: z.string().nullable().optional(),
  // Image dimensions for auto-placement calculation
  image_width: z.number().int().positive().optional(),
  image_height: z.number().int().positive().optional(),
});

/**
 * Schema for create custom product response
 */
export const CreateCustomProductResponseSchema = z.object({
  success: z.boolean(),
  product: CreatedProductSchema,
  error: z.string().optional(),
});
