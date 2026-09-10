import { createClient } from "@/lib/supabase/client";
import { InvoiceSchema } from "@/schemas/invoice";
import { InvoiceT, GenerateInvoiceResponseI } from "@/types/invoice";
import { ErrorClient } from "./errorClient";

export class InvoiceService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Get the issued invoice for an order, if one exists.
   * Returns null when no invoice has been generated yet.
   */
  static async getInvoiceForOrder(orderId: string): Promise<InvoiceT | null> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("order_id", orderId)
        .eq("type", "invoice")
        .eq("status", "issued")
        .maybeSingle();

      if (error) {
        throw ErrorClient.handleError({ error, service: "Invoice", action: "Get Invoice For Order" });
      }

      if (!data) {
        return null;
      }

      return InvoiceSchema.parse(data) as InvoiceT;
    } catch (error) {
      throw ErrorClient.handleError({ error, service: "Invoice", action: "Get Invoice For Order" });
    }
  }

  /**
   * Generate (or fetch) the invoice for a paid order via the
   * generate-invoice edge function. Idempotent server-side; returns the
   * invoice plus a short-lived signed download URL.
   */
  static async generateInvoice(orderId: string): Promise<GenerateInvoiceResponseI> {
    const supabase = this.getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw ErrorClient.handleError({
        error: new Error("Not authenticated"),
        service: "Invoice",
        action: "Generate Invoice"
      });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-invoice`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_id: orderId }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw ErrorClient.handleError({
        error: new Error(data.error || "Failed to generate invoice"),
        service: "Invoice",
        action: "Generate Invoice",
      });
    }

    return data as GenerateInvoiceResponseI;
  }

  /**
   * Create a signed download URL for an already-generated invoice PDF.
   * Works client-side because storage RLS lets users read their own
   * {user_id}/... objects in the private invoices bucket.
   */
  static async getInvoiceDownloadUrl(invoice: InvoiceT, expiresInSeconds = 3600): Promise<string | null> {
    if (!invoice.pdf_path) {
      return null;
    }

    const supabase = this.getSupabase();
    const { data, error } = await supabase.storage
      .from(invoice.pdf_bucket || "invoices")
      .createSignedUrl(invoice.pdf_path, expiresInSeconds);

    if (error) {
      throw ErrorClient.handleError({
        error,
        service: "Invoice",
        action: "Get Invoice Download URL"
      });
    }

    return data?.signedUrl ?? null;
  }
}
