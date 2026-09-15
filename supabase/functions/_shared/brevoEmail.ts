import { encodeBase64 } from "jsr:@std/encoding@1/base64";
import { resolveBrevoConfig } from "./emailConfig.ts";

/**
 * Email delivery via Brevo (formerly Sendinblue) HTTP API.
 *
 * Configuration is resolved by `resolveBrevoConfig` (emailConfig.ts):
 * in production a missing BREVO_API_KEY / sender THROWS `EmailNotConfiguredError`
 * so callers surface it (Sentry) instead of silently sending nothing;
 * outside production sending is skipped with a loud warning.
 *
 * Secrets:
 *   BREVO_API_KEY         Brevo API key
 *   BREVO_FROM_EMAIL      sender email, e.g. "orders@stamp.ai" (falls back to INVOICE_FROM_EMAIL)
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
  /** Plain-text alternative (recommended for deliverability). */
  textContent?: string;
  attachments?: BrevoEmailAttachment[];
}

/**
 * Send an email via Brevo's transactional email API.
 * Returns true when the email was sent, false when skipped or failed.
 * @throws EmailNotConfiguredError in production when Brevo is not configured.
 */
export async function sendBrevoEmail(params: SendBrevoEmailParams): Promise<boolean> {
  const config = resolveBrevoConfig({
    BREVO_API_KEY: Deno.env.get("BREVO_API_KEY"),
    BREVO_FROM_EMAIL: Deno.env.get("BREVO_FROM_EMAIL"),
    BREVO_FROM_NAME: Deno.env.get("BREVO_FROM_NAME"),
    INVOICE_FROM_EMAIL: Deno.env.get("INVOICE_FROM_EMAIL"),
    INVOICE_SELLER_NAME: Deno.env.get("INVOICE_SELLER_NAME"),
    SENTRY_ENVIRONMENT: Deno.env.get("SENTRY_ENVIRONMENT"),
    DENO_ENV: Deno.env.get("DENO_ENV"),
    ENVIRONMENT: Deno.env.get("ENVIRONMENT"),
    SUPABASE_URL: Deno.env.get("SUPABASE_URL"),
  });

  if (config.status === "skipped") {
    console.warn(`⚠️  EMAIL NOT SENT (non-production): ${config.reason}. Subject: "${params.subject}"`);
    return false;
  }

  const payload: Record<string, unknown> = {
    sender: {
      email: config.fromEmail,
      name: config.fromName,
    },
    to: [{ email: params.to }],
    subject: params.subject,
    htmlContent: params.htmlContent,
  };

  if (params.textContent) {
    payload.textContent = params.textContent;
  }

  if (params.attachments && params.attachments.length > 0) {
    payload.attachment = params.attachments;
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": config.apiKey,
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
