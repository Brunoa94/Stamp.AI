import { z } from "zod";

// Mockup image returned by Printify API
const MockupImageSchema = z.object({
  src: z.string(),
  variant_ids: z.array(z.number()),
  position: z.string(),
  is_default: z.boolean(),
  is_selected_for_publishing: z.boolean().optional(),
  order: z.number().nullable().optional(),
});

// Variant returned by Printify API
const VariantSchema = z.object({
  id: z.number(),
  sku: z.string(),
  cost: z.number(), // Price in cents
  price: z.number(), // Selling price in cents
  title: z.string(),
  grams: z.number().optional(),
  is_enabled: z.boolean(),
  is_default: z.boolean(),
  is_available: z.boolean(),
  is_printify_express_eligible: z.boolean().optional(),
  options: z.array(z.number()).optional(),
  quantity: z.number().optional(),
});

// Pattern schema for print areas
const PatternSchema = z.object({
  spacing_x: z.number(),
  spacing_y: z.number(),
  scale: z.number(),
  offset: z.number(),
});

// Image within print area placeholder
const PrintAreaImageSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  scale: z.number(),
  angle: z.number(),
  pattern: PatternSchema.optional(),
});

const PlaceholderSchema = z.object({
  position: z.string(),
  images: z.array(PrintAreaImageSchema),
});

const PrintAreaSchema = z.object({
  variant_ids: z.array(z.number()),
  placeholders: z.array(PlaceholderSchema),
});

// Full custom product from Printify
export const CustomProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
  options: z.array(z.any()).optional(),
  images: z.array(MockupImageSchema),
  variants: z.array(VariantSchema),
  print_provider_id: z.number(),
  blueprint_id: z.number(),
  print_areas: z.array(PrintAreaSchema).optional(),
  sales_channel_properties: z.array(z.any()).optional(),
});
