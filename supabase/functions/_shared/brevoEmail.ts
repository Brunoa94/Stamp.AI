import { encodeBase64 } from "jsr:@std/encoding@1/base64";
import { resolveBrevoConfig } from "./emailConfig.ts";
import { reportError } from "./errorReporting.ts";

/**
 * Email delivery via Brevo (formerly Sendinblue) HTTP API.
 *
 * Outside production a missing BREVO_API_KEY disables email. In production a
 * missing key or sender is reported (Sentry) instead of being skipped
 * silently; callers still never fail because of email delivery.
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
  /** Plain-text alternative for clients that do not render HTML. */
  textContent?: string;
  attachments?: BrevoEmailAttachment[];
}

/**
 * Send an email via Brevo's transactional email API.
 * Returns true when the email was sent, false when skipped or failed.
 */
export async function sendBrevoEmail(params: SendBrevoEmailParams): Promise<boolean> {
  const config = resolveBrevoConfig(Deno.env.toObject());
  if (config.status === "disabled") {
    console.log("BREVO_API_KEY not configured, skipping email");
    return false;
  }
  if (config.status === "misconfigured") {
    const error = new Error(`Transactional email is not configured: missing ${config.missing.join(", ")}`);
    console.error(error.message);
    reportError(error, { subject: params.subject });
    return false;
  }
  const { apiKey, fromEmail, fromName } = config;

  const payload: Record<string, unknown> = {
    sender: {
      email: fromEmail,
      name: fromName,
    },
    to: [{ email: params.to }],
    subject: params.subject,
    htmlContent: params.htmlContent,
    ...(params.textContent ? { textContent: params.textContent } : {}),
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
    console.log(`✅ Email sent via Brevo (messageId: ${result.messageId})`);
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
