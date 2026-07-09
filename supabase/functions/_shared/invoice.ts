import { supabaseRest } from "./supabase.ts";
import { validateEnvVars } from "./validators.ts";
import { documentTitle, getSellerInfo, InvoiceRowI, renderInvoiceHtml } from "./invoiceTemplate.ts";
import { renderInvoicePdf } from "./invoicePdf.ts";
import { sendInvoiceEmail } from "./invoiceEmail.ts";

export const INVOICES_BUCKET = "invoices";

async function uploadInvoicePdf(path: string, pdfBytes: Uint8Array): Promise<void> {
  const supabaseUrl = validateEnvVars.supabaseUrl();
  const serviceKey = validateEnvVars.supabaseServiceKey();

  const response = await fetch(`${supabaseUrl}/storage/v1/object/${INVOICES_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/pdf",
      "x-upsert": "true",
    },
    body: pdfBytes,
  });

  if (!response.ok) {
    throw new Error(`Invoice PDF upload failed: ${response.status} ${await response.text()}`);
  }
}

/**
 * Create a short-lived signed URL for an invoice PDF (service role).
 */
export async function createInvoiceSignedUrl(pdfPath: string, expiresInSeconds = 3600): Promise<string | null> {
  const supabaseUrl = validateEnvVars.supabaseUrl();
  const serviceKey = validateEnvVars.supabaseServiceKey();

  const response = await fetch(`${supabaseUrl}/storage/v1/object/sign/${INVOICES_BUCKET}/${pdfPath}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: expiresInSeconds }),
  });

  if (!response.ok) {
    console.error("Failed to sign invoice URL:", response.status, await response.text());
    return null;
  }

  const { signedURL } = await response.json();
  return signedURL ? `${supabaseUrl}/storage/v1${signedURL}` : null;
}

/**
 * Issue the invoice for a paid order (idempotent), generate + store its PDF,
 * and email it to the customer.
 *
 * Safe to call multiple times: numbering/issuance is handled atomically by the
 * create_invoice_for_order RPC, the PDF is only rendered once, and the email
 * is only sent once (tracked via emailed_at).
 */
export async function ensureInvoiceForOrder(orderId: string): Promise<InvoiceRowI> {
  const rpcResult = await supabaseRest<InvoiceRowI[]>(
    "rpc/create_invoice_for_order",
    "POST",
    { p_order_id: orderId }
  );

  if (rpcResult.error || !rpcResult.data?.[0]) {
    throw new Error(`create_invoice_for_order failed for order ${orderId}: ${JSON.stringify(rpcResult.error)}`);
  }

  let invoice = rpcResult.data[0];
  const seller = getSellerInfo();

  // Generate and store the PDF once
  if (!invoice.pdf_path) {
    const pdfBytes = await renderInvoicePdf(invoice, seller);
    const pdfPath = `${invoice.user_id || "guest"}/${invoice.invoice_number}.pdf`;

    await uploadInvoicePdf(pdfPath, pdfBytes);

    const patchResult = await supabaseRest<InvoiceRowI[]>(
      `invoices?id=eq.${invoice.id}`,
      "PATCH",
      { pdf_bucket: INVOICES_BUCKET, pdf_path: pdfPath },
      { prefer: "return=representation" }
    );

    if (patchResult.error) {
      throw new Error(`Failed to store invoice pdf_path: ${JSON.stringify(patchResult.error)}`);
    }

    invoice = patchResult.data?.[0] ?? { ...invoice, pdf_bucket: INVOICES_BUCKET, pdf_path: pdfPath };
    console.log(`✅ Invoice PDF generated: ${invoice.invoice_number} -> ${pdfPath}`);

    // Email once, best-effort — never fail invoice generation over delivery
    if (!invoice.emailed_at && invoice.customer_email) {
      const title = documentTitle(invoice.type);
      const sent = await sendInvoiceEmail({
        to: invoice.customer_email,
        subject: `${seller.name} — ${title} ${invoice.invoice_number} for order ${invoice.order_number}`,
        html: renderInvoiceHtml(invoice, seller),
        pdfBytes,
        pdfFilename: `${invoice.invoice_number}.pdf`,
      });

      if (sent) {
        await supabaseRest(`invoices?id=eq.${invoice.id}`, "PATCH", {
          emailed_at: new Date().toISOString(),
        });
      }
    }
  }

  return invoice;
}

/**
 * Best-effort wrapper for webhooks: invoice generation must never cause a
 * payment webhook to fail (providers would retry the whole event).
 */
export async function tryGenerateInvoiceForOrder(orderId: string | null | undefined): Promise<void> {
  if (!orderId) return;

  try {
    const invoice = await ensureInvoiceForOrder(orderId);
    console.log(`✅ Invoice ensured for order ${orderId}: ${invoice.invoice_number}`);
  } catch (error) {
    console.error(`Invoice generation failed for order ${orderId} (non-blocking):`, error);
  }
}
