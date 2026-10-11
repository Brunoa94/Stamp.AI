import { sendInvoiceEmailBrevo } from "./brevoEmail.ts";

/**
 * Invoice email delivery via Brevo.
 *
 * Email delivery never blocks invoice generation; a missing configuration is
 * reported in production and skipped elsewhere (see emailConfig.ts).
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
  // Configuration (and reporting a missing one) is handled by sendBrevoEmail.
  return sendInvoiceEmailBrevo(params);
}
