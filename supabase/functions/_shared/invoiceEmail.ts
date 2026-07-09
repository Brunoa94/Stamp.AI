/**
 * Invoice email delivery via Resend (https://resend.com).
 *
 * Optional integration — when RESEND_API_KEY is not configured, sending is
 * skipped silently so invoice generation never depends on email delivery.
 *
 * Secrets:
 *   RESEND_API_KEY      Resend API key (omit to disable email)
 *   INVOICE_FROM_EMAIL  sender, e.g. "Stamp.AI <invoices@stamp.ai>"
 */

// Base64-encode without spreading large arrays onto the call stack
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

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
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.log("RESEND_API_KEY not configured, skipping invoice email");
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
      console.error("Failed to send invoice email:", response.status, await response.text());
      return false;
    }

    console.log(`✅ Invoice email sent to ${params.to}`);
    return true;
  } catch (error) {
    console.error("Exception sending invoice email:", error);
    return false;
  }
}
