/**
 * Email delivery via Brevo (formerly Sendinblue) HTTP API for Next.js
 * server code (API routes and route handlers).
 *
 * Counterpart of supabase/functions/_shared/brevoEmail.ts, which serves the
 * Deno edge functions; this variant reads Node's process.env.
 *
 * Env vars:
 *   BREVO_API_KEY         Brevo API key (required to send)
 *   BREVO_FROM_EMAIL      sender email (falls back to INVOICE_FROM_EMAIL)
 *   BREVO_FROM_NAME       sender name (falls back to INVOICE_SELLER_NAME, then "Stamp.AI")
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export interface SendBrevoEmailParamsI {
  to: string;
  subject: string;
  htmlContent: string;
}

/**
 * Send a transactional email via Brevo.
 * Returns true when the email was sent, false when skipped or failed.
 */
export async function sendBrevoEmail(
  params: SendBrevoEmailParamsI,
): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error("BREVO_API_KEY not configured, cannot send email");
    return false;
  }

  const fromEmail = process.env.BREVO_FROM_EMAIL ||
    process.env.INVOICE_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME ||
    process.env.INVOICE_SELLER_NAME || "Stamp.AI";

  if (!fromEmail) {
    console.error("BREVO_FROM_EMAIL or INVOICE_FROM_EMAIL must be configured");
    return false;
  }

  const payload = {
    sender: {
      email: fromEmail,
      name: fromName,
    },
    to: [{ email: params.to }],
    subject: params.subject,
    htmlContent: params.htmlContent,
  };

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
    console.log(
      `✅ Email sent via Brevo (messageId: ${result.messageId}) to ${params.to}`,
    );
    return true;
  } catch (error) {
    console.error("Exception sending email via Brevo:", error);
    return false;
  }
}
