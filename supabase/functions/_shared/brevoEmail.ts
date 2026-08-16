import { encodeBase64 } from "jsr:@std/encoding@1/base64";

/**
 * Email delivery via Brevo (formerly Sendinblue) HTTP API.
 *
 * Optional integration — when BREVO_API_KEY is not configured, sending is
 * skipped silently so invoice generation never depends on email delivery.
 *
 * Secrets:
 *   BREVO_API_KEY         Brevo API key (omit to disable email)
 *   BREVO_FROM_EMAIL      sender email, e.g. "invoices@stamp.ai"
 *   BREVO_FROM_NAME       sender name, e.g. "Stamp.AI" (falls back to INVOICE_SELLER_NAME)
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export interface BrevoEmailAttachment {
  /** Base64-encoded content */
  content: string;
  /** Filename with extension */
  name: string;
}

export interface SendBrevoEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  attachments?: BrevoEmailAttachment[];
}

/**
 * Send an email via Brevo's transactional email API.
 * Returns true when the email was sent, false when skipped or failed.
 */
export async function sendBrevoEmail(params: SendBrevoEmailParams): Promise<boolean> {
  const apiKey = Deno.env.get("BREVO_API_KEY");

  if (!apiKey) {
    console.log("BREVO_API_KEY not configured, skipping email");
    return false;
  }

  const fromEmail = Deno.env.get("BREVO_FROM_EMAIL") || Deno.env.get("INVOICE_FROM_EMAIL");
  const fromName =
    Deno.env.get("BREVO_FROM_NAME") || Deno.env.get("INVOICE_SELLER_NAME") || "Stamp.AI";

  if (!fromEmail) {
    console.error("BREVO_FROM_EMAIL or INVOICE_FROM_EMAIL must be configured");
    return false;
  }

  const payload: Record<string, unknown> = {
    sender: {
      email: fromEmail,
      name: fromName,
    },
    to: [{ email: params.to }],
    subject: params.subject,
    htmlContent: params.htmlContent,
  };

  if (params.attachments && params.attachments.length > 0) {
    payload.attachment = params.attachments;
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo email error:", response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log(`✅ Email sent via Brevo (messageId: ${result.messageId}) to ${params.to}`);
    return true;
  } catch (error) {
    console.error("Exception sending email via Brevo:", error);
    return false;
  }
}

/**
 * Helper to convert Uint8Array to base64 for attachments.
 */
export function toBase64(bytes: Uint8Array): string {
  return encodeBase64(bytes);
}

/**
 * Send an invoice email with PDF attachment via Brevo.
 * This is a convenience wrapper matching the existing invoice email interface.
 */
export interface SendInvoiceEmailBrevoParams {
  to: string;
  subject: string;
  html: string;
  pdfBytes: Uint8Array;
  pdfFilename: string;
}

export async function sendInvoiceEmailBrevo(params: SendInvoiceEmailBrevoParams): Promise<boolean> {
  return sendBrevoEmail({
    to: params.to,
    subject: params.subject,
    htmlContent: params.html,
    attachments: [
      {
        content: toBase64(params.pdfBytes),
        name: params.pdfFilename,
      },
    ],
  });
}
