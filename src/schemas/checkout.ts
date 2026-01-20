import { z } from "zod";

// Shipping Address Schema
export const ShippingAddressSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  region: z.string().optional(),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  zip: z.string().optional(),
});

export type ShippingAddressT = z.infer<typeof ShippingAddressSchema>;

// Product Customization Schema
export const ProductCustomizationSchema = z.object({
  product_id: z.string().optional(),
  variant_id: z.number(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  print_areas: z.object({
    front: z.string().optional(),
    back: z.string().optional(),
    left_sleeve: z.string().optional(),
    right_sleeve: z.string().optional(),
    neck: z.string().optional(),
  }),
  product_title: z.string(),
  variant_title: z.string(),
  price: z.number().min(0),
  preview_url: z.string().optional(),
  blueprint_id: z.number().optional(),
  print_provider_id: z.number().optional(),
  tshirt_type: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    blueprint_id: z.number(),
    print_provider_id: z.number(),
  }).optional(),
});

export type ProductCustomizationT = z.infer<typeof ProductCustomizationSchema>;

// Printify Image Schema
export const PrintifyImageSchema = z.object({
  id: z.string(),
  file_name: z.string(),
  preview_url: z.string().optional(),
});

export type PrintifyImageT = z.infer<typeof PrintifyImageSchema>;

// Catalog Blueprint Schema
export const CatalogBlueprintSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  brand: z.string(),
  model: z.string(),
  images: z.array(z.string()),
  printAreas: z.array(
    z.object({
      position: z.string(),
      width: z.number(),
      height: z.number(),
    })
  ),
});

export type CatalogBlueprintT = z.infer<typeof CatalogBlueprintSchema>;

// Variant Info Schema
export const VariantInfoSchema = z.object({
  id: z.number(),
  title: z.string(),
  options: z.object({
    color: z.string().optional(),
    size: z.string().optional(),
  }),
});

export type VariantInfoT = z.infer<typeof VariantInfoSchema>;

// Custom Product Schema (result from Printify)
export const CustomProductSchema = z.object({
  id: z.string(),
  variant_id: z.number(),
  title: z.string(),
  price: z.number(),
});

export type CustomProductT = z.infer<typeof CustomProductSchema>;
