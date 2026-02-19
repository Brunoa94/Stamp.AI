import { z } from "zod";

// Input validation schemas
export const addToCartSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  product_name: z.string().min(1, "Product name is required"),
  variant_id: z.string().uuid().optional().nullable(),
  quantity: z.number().int().min(1).max(99),
  unit_price: z.number().positive(),
  custom_image_url: z.string().url().optional(),
  design_id: z.string().uuid().optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

// Response validation schemas
export const CartSchema = z.object({
  id: z.string(),
  user_id: z.string().nullable(),
  session_id: z.string().nullable(),
  user_email: z.string().email().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
}).passthrough(); // Allow additional fields from database

// Base cart item schema (without relations)
const CartItemRowSchema = z.object({
  id: z.string(),
  cart_id: z.string(),
  product_id: z.string().nullable(),
  product_name: z.string(),
  variant_id: z.string().nullable(),
  quantity: z.number(),
  unit_price: z.number(),
  custom_image_url: z.string().nullable(),
  design_id: z.string().nullable(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
}).passthrough(); // Allow additional fields from database

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  base_price: z.number(),
}).passthrough();

const VariantSchema = z.object({
  id: z.string(),
  name: z.string(),
}).passthrough();

// Primary cart item schema with relations (use this for validation)
export const CartItemSchema = CartItemRowSchema.extend({
  product: ProductSchema.nullable().optional(),
  variant: VariantSchema.nullable().optional(),
});

export const CartWithItemsSchema = CartSchema.extend({
  cart_items: z.array(CartItemSchema).default([]),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
