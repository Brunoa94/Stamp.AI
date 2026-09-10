import { encodeBase64 } from "jsr:@std/encoding@1/base64";
import { sendInvoiceEmailBrevo } from "./brevoEmail.ts";

/**
 * Invoice email delivery.
 *
 * Providers (in priority order):
 *   1. Brevo (BREVO_API_KEY) — recommended
 *   2. Resend (RESEND_API_KEY) — fallback/legacy
 *
 * Optional integration — when no API key is configured, sending is
 * skipped silently so invoice generation never depends on email delivery.
 *
 * Secrets:
 *   BREVO_API_KEY       Brevo API key (preferred)
 *   BREVO_FROM_EMAIL    sender email for Brevo
 *   BREVO_FROM_NAME     sender name for Brevo (falls back to INVOICE_SELLER_NAME)
 *   RESEND_API_KEY      Resend API key (fallback, omit to disable)
 *   INVOICE_FROM_EMAIL  sender for Resend, e.g. "Stamp.AI <invoices@stamp.ai>"
 */

// Base64-encode attachment bytes for Resend
function toBase64(bytes: Uint8Array): string {
  return encodeBase64(bytes);
}

export interface SendInvoiceEmailParamsI {
  to: string;
  subject: string;
  html: string;
  pdfBytes: Uint8Array;
  pdfFilename: string;
}

/**
 * Send invoice email via Resend (legacy fallback).
 */
async function sendViaResend(params: SendInvoiceEmailParamsI): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return false;
  }

  const from = Deno.env.get("INVOICE_FROM_EMAIL") || "Stamp.AI <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        attachments: [
          {
            filename: params.pdfFilename,
            content: toBase64(params.pdfBytes),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Failed to send invoice email via Resend:", response.status, await response.text());
      return false;
    }

    console.log(`✅ Invoice email sent via Resend to ${params.to}`);
    return true;
  } catch (error) {
    console.error("Exception sending invoice email via Resend:", error);
    return false;
  }
}

/**
 * Send the invoice email with the PDF attached.
 * Tries Brevo first, falls back to Resend if Brevo is not configured.
 * Returns true when the email was sent, false when skipped or failed.
 */
export async function sendInvoiceEmail(params: SendInvoiceEmailParamsI): Promise<boolean> {
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");

  // Try Brevo first (preferred)
  if (brevoKey) {
    return sendInvoiceEmailBrevo(params);
  }

  // Fallback to Resend
  if (resendKey) {
    return sendViaResend(params);
  }

  console.log("No email provider configured (BREVO_API_KEY or RESEND_API_KEY), skipping invoice email");
  return false;
}
