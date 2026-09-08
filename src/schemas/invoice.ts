import { z } from "zod";

/**
 * Zod schema for invoice line items (snapshot of order_items at issuance)
 */
const InvoiceLineItemSchema = z.object({
  product_name: z.string(),
  variant_name: z.string().nullable(),
  quantity: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
});

/**
 * Zod schema for invoices from database
 */
export const InvoiceSchema = z
  .object({
    id: z.string(),
    invoice_number: z.string(),
    type: z.enum(["invoice", "credit_note"]),
    status: z.string(),
    related_invoice_id: z.string().nullable(),
    order_id: z.string(),
    order_number: z.string(),
    user_id: z.string().nullable(),
    customer_email: z.string(),
    customer_name: z.string().nullable(),
    billing_address: z.any().nullable(),
    shipping_address: z.any().nullable(),
    currency: z.string(),
    subtotal: z.number(),
    tax_amount: z.number(),
    discount_amount: z.number(),
    shipping_cost: z.number(),
    total_amount: z.number(),
    line_items: z.array(InvoiceLineItemSchema),
    payment_method: z.string().nullable(),
    payment_provider: z.string().nullable(),
    pdf_bucket: z.string().nullable(),
    pdf_path: z.string().nullable(),
    emailed_at: z.string().nullable(),
    issued_at: z.string(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
  .passthrough();

/**
 * Infer TypeScript types from Zod schemas
 */
export type InvoiceLineItemSchemaT = z.infer<typeof InvoiceLineItemSchema>;
export type InvoiceSchemaT = z.infer<typeof InvoiceSchema>;
