import { sendInvoiceEmailBrevo } from "./brevoEmail.ts";
import { EmailNotConfiguredError } from "./emailConfig.ts";
import { captureException } from "./sentry.ts";

/**
 * Invoice email delivery via Brevo.
 *
 * Configuration is resolved by brevoEmail.ts: in production a missing
 * BREVO_API_KEY / sender is reported to Sentry (invoice generation itself
 * must never fail over email delivery); elsewhere it is skipped with a warning.
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
  try {
    return await sendInvoiceEmailBrevo(params);
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      console.error(`❌ Invoice email not sent: ${error.message}`);
      captureException(error, { extra: { subject: params.subject } });
      return false;
    }
    throw error;
  }
}
