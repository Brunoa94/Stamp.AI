import { sendInvoiceEmailBrevo } from "./brevoEmail.ts";

/**
 * Invoice email delivery via Brevo.
 *
 * Optional integration — when no API key is configured, sending is
 * skipped silently so invoice generation never depends on email delivery.
 *
 * Secrets:
 *   BREVO_API_KEY       Brevo API key (required to send)
 *   BREVO_FROM_EMAIL    sender email for Brevo
 *   BREVO_FROM_NAME     sender name for Brevo (falls back to INVOICE_SELLER_NAME)
 */

export interface SendInvoiceEmailParamsI {
  to: string;
  subject: string;
  html: string;
  pdfBytes: Uint8Array;
  pdfFilename: string;
}

/**
 * Send the invoice email with the PDF attached.
 * Returns true when the email was sent, false when skipped or failed.
 */
export async function sendInvoiceEmail(params: SendInvoiceEmailParamsI): Promise<boolean> {
  const brevoKey = Deno.env.get("BREVO_API_KEY");

  if (!brevoKey) {
    console.log("BREVO_API_KEY not configured, skipping invoice email");
    return false;
  }

  return sendInvoiceEmailBrevo(params);
}
