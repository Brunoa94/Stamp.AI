import { z } from "zod";

/**
 * Zod schema for order items from database
 */
export const OrderItemSchema = z.object({
  id: z.string(),
  order_id: z.string().nullable(),
  product_id: z.string().nullable(),
  variant_id: z.string().nullable(),
  product_name: z.string(),
  variant_name: z.string().nullable(),
  quantity: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
  custom_image_url: z.string(),
  design_config: z.any().nullable(),
  fulfillment_status: z.string().nullable(),
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
  total_amount: z.number().nullable(),
  subtotal: z.number().nullable(),
  tax_amount: z.number().nullable(),
  shipping_cost: z.number().nullable(),
  discount_amount: z.number().nullable(),
  currency: z.string().nullable(),
  payment_method: z.string().nullable(),
  printify_order_id: z.string().nullable(),
  shipping_address: z.any().nullable(),
  billing_address: z.any().nullable(),
  shipping_method: z.string().nullable(),
  tracking_number: z.string().nullable(),
  tracking_url: z.string().nullable(),
  customer_notes: z.string().nullable(),
  internal_notes: z.string().nullable(),
  // Backward compatibility: older schemas had orders.product_id,
  // but current remote schema may omit this column.
  product_id: z.string().nullable().optional(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  shipped_at: z.string().nullable(),
  delivered_at: z.string().nullable(),
  // Additional fields from database schema
  cancellation_reason: z.string().nullable().optional(),
  cancelled_at: z.string().nullable().optional(),
  confirmed_at: z.string().nullable().optional(),
  expired_at: z.string().nullable().optional(),
  failed_at: z.string().nullable().optional(),
  idempotency_key: z.string().nullable().optional(),
  payment_gateway: z.string().nullable().optional(),
  payment_intent_id: z.string().nullable().optional(),
  printify_error: z.string().nullable().optional(),
  refund_amount: z.number().nullable().optional(),
  refund_status: z.string().nullable().optional(),
  refunded_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  last_refund_error: z.string().nullable().optional(),
  manual_review_required: z.boolean().nullable().optional(),
  paid_at: z.string().nullable().optional(),
  payment_provider: z.string().nullable().optional(),
  promo_code_id: z.string().nullable().optional(),
  refund_id: z.string().nullable().optional(),
  refund_reason: z.string().nullable().optional(),
  requires_manual_review: z.boolean().nullable().optional(),
  stripe_payment_intent_id: z.string().nullable().optional(),
  payment_failure_reason: z.string().nullable().optional(),
  promo_code: z.string().nullable().optional(),
  promo_value: z.number().nullable().optional(),
  refund_attempts: z.number().nullable().optional(),
  refund_failed: z.boolean().nullable().optional(),
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
