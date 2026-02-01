import { z } from "zod";

// Input validation schemas
export const addToCartSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
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
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  session_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  cart_id: z.string().uuid(),
  product_id: z.string().uuid().nullable(),
  variant_id: z.string().uuid().nullable(),
  quantity: z.number().int(),
  unit_price: z.number(),
  custom_image_url: z.string().nullable(),
  design_id: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  base_price: z.number(),
});

const VariantSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const CartItemWithProductSchema = CartItemSchema.extend({
  product: ProductSchema.optional(),
  variant: VariantSchema.optional(),
});

export const CartWithItemsSchema = CartSchema.extend({
  cart_items: z.array(CartItemWithProductSchema),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
