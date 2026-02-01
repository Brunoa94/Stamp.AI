import { z } from "zod";

/**
 * Zod schema for order items from database
 */
export const OrderItemSchema = z.object({
  id: z.string(),
  order_id: z.string().nullable(),
  product_id: z.string().nullable(),
  variant_id: z.string().nullable(),
  design_id: z.string().nullable(),
  product_name: z.string(),
  variant_name: z.string().nullable(),
  quantity: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
  custom_image_url: z.string(),
  design_config: z.any().nullable(),
  fulfillment_status: z.string().nullable(),
  external_order_id: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * Zod schema for orders from database
 */
export const OrderSchema = z.object({
  id: z.string(),
  order_number: z.string(),
  user_id: z.string().nullable(),
  customer_email: z.string(),
  customer_name: z.string().nullable(),
  customer_phone: z.string().nullable(),
  status: z.string().nullable(),
  payment_status: z.string().nullable(),
  fulfillment_status: z.string().nullable(),
  total_amount: z.number().nullable(),
  subtotal: z.number().nullable(),
  tax_amount: z.number().nullable(),
  shipping_cost: z.number().nullable(),
  discount_amount: z.number().nullable(),
  currency: z.string().nullable(),
  payment_method: z.string().nullable(),
  stripe_payment_intent_id: z.string().nullable(),
  stripe_customer_id: z.string().nullable(),
  shipping_address: z.any().nullable(),
  billing_address: z.any().nullable(),
  shipping_method: z.string().nullable(),
  tracking_number: z.string().nullable(),
  tracking_url: z.string().nullable(),
  customer_notes: z.string().nullable(),
  internal_notes: z.string().nullable(),
  product_id: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  shipped_at: z.string().nullable(),
  delivered_at: z.string().nullable(),
});

/**
 * Zod schema for orders with order items included
 */
export const OrderWithItemsSchema = OrderSchema.extend({
  order_items: z.array(OrderItemSchema),
});

/**
 * Infer TypeScript types from Zod schemas
 */
export type OrderItemSchemaT = z.infer<typeof OrderItemSchema>;
export type OrderSchemaT = z.infer<typeof OrderSchema>;
export type OrderWithItemsSchemaT = z.infer<typeof OrderWithItemsSchema>;
