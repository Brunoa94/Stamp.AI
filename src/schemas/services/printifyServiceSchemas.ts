import { z } from "zod";

/**
 * Printify Service Schemas
 * Validation schemas for Printify API requests and responses
 *
 * Note: Blueprint variants schemas are now in @/schemas/printify
 * since ProductCustomizationService calls Supabase Edge Functions directly
 */

/**
 * Schema for custom product response
 */
export const CustomProductResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  options: z.array(z.any()).optional(),
  variants: z.array(z.any()).optional(),
  images: z.array(z.any()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  visible: z.boolean().optional(),
  is_locked: z.boolean().optional(),
  blueprint_id: z.number().optional(),
  user_id: z.number().optional(),
  shop_id: z.number().optional(),
  print_provider_id: z.number().optional(),
  print_areas: z.array(z.any()).optional(),
  print_details: z.array(z.any()).optional(),
  sales_channel_properties: z.array(z.any()).optional(),
});

/**
 * Schema for line item in Printify order
 */
export const PrintifyOrderLineItemSchema = z.object({
  product_id: z.string().optional(),
  variant_id: z.number(),
  quantity: z.number().int().positive().default(1),
  blueprint_id: z.number().optional(),
  print_provider_id: z.number().optional(),
  print_areas: z.record(z.string(), z.any()).optional(),
  print_details: z.record(z.string(), z.any()).optional(),
  sku: z.string().optional(),
});

/**
 * Schema for shipping address
 */
export const ShippingAddressSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  country: z.string().min(2, "Country code is required"),
  region: z.string().optional(),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  zip: z.string().optional(),
});

/**
 * Schema for create Printify order request
 */
export const CreatePrintifyOrderRequestSchema = z.object({
  line_items: z.array(PrintifyOrderLineItemSchema).min(1, "At least one line item is required"),
  shipping_method: z.number().optional(),
  shipping_address: ShippingAddressSchema.optional(),
  address_to: ShippingAddressSchema.optional(),
  is_test: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  use_sample_order: z.boolean().optional(),
  auto_cancel: z.boolean().optional(),
});

/**
 * Schema for Printify order response
 */
export const PrintifyOrderResponseSchema = z.object({
  success: z.boolean(),
  order: z.object({
    id: z.string(),
    external_id: z.string().optional(),
    status: z.string(),
    line_items: z.array(z.any()),
    shipping_method: z.number().optional(),
    address_to: z.record(z.string(), z.any()).optional(),
    created_at: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
  skipped: z.boolean().optional(),
  message: z.string().optional(),
});
