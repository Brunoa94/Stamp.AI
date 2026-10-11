import { z } from "zod";

/** Exact phrase a user must type to confirm irreversible account deletion. */
export const ACCOUNT_DELETION_CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

export const DeleteAccountRequestSchema = z.object({
  confirmation: z.string().min(1),
  /** Required when the account has an email/password identity. */
  password: z.string().min(1).optional(),
  reason: z.string().trim().max(500).optional(),
});

export type DeleteAccountRequestType = z.infer<typeof DeleteAccountRequestSchema>;

const InvoicePdfRefSchema = z.object({
  bucket: z.string().min(1),
  path: z.string().min(1),
});

export type InvoicePdfRefType = z.infer<typeof InvoicePdfRefSchema>;

const OpenOrderSchema = z.object({
  order_number: z.string(),
  status: z.string().nullable(),
  payment_status: z.string().nullable(),
});

/** Structured result of the delete_own_account() RPC. */
export const DeleteOwnAccountResultSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    user_id: z.string().uuid(),
    invoice_pdfs: z.array(InvoicePdfRefSchema),
    orders_anonymised: z.number().int(),
    invoices_anonymised: z.number().int(),
    payments_anonymised: z.number().int(),
  }),
  z.object({
    ok: z.literal(false),
    reason: z.literal("OPEN_ORDERS"),
    open_orders: z.array(OpenOrderSchema),
    pending_payment_recoveries: z.number().int(),
    unresolved_refunds: z.number().int(),
  }),
]);

export type DeleteOwnAccountResultType = z.infer<typeof DeleteOwnAccountResultSchema>;
