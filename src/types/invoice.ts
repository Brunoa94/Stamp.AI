import type { InvoiceLineItemSchemaT, InvoiceSchemaT } from "@/schemas/invoice";

// Note: derived from the Zod schema rather than Database types because the
// invoices migration has not been applied yet. Once it is applied and
// `npm run supabase:types` is re-run, these can switch to
// Database['public']['Tables']['invoices'] like the other type files.
export type InvoiceT = InvoiceSchemaT;
export type InvoiceLineItemT = InvoiceLineItemSchemaT;

export interface GenerateInvoiceResponseI {
  success: boolean;
  invoice: InvoiceT;
  download_url: string | null;
}
