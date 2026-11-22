import { supabaseRest } from "./supabase.ts";
import { validateEnvVars } from "./validators.ts";
import { documentTitle, getSellerInfo, InvoiceRowI, renderInvoiceHtml, SellerInfoI } from "./invoiceTemplate.ts";
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
 * is only sent once (claimed through emailed_at, see emailInvoiceOnce).
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

    await emailInvoiceOnce(invoice, seller, pdfBytes);
    return invoice;
  }

  await emailInvoiceOnce(invoice, seller);
  return invoice;
}

/**
 * Email the invoice with its PDF, at most once, best-effort: delivery never
 * fails invoice generation.
 *
 * The send is claimed atomically through emailed_at (PATCH ... WHERE
 * emailed_at IS NULL), so overlapping calls (a payment webhook and its
 * retry, or a webhook and an invoice download) can't both send it. A failed
 * send releases the claim so a later call retries. `pdfBytes` is the freshly
 * rendered PDF; without it the stored invoice is rendered again.
 */
async function emailInvoiceOnce(invoice: InvoiceRowI, seller: SellerInfoI, pdfBytes?: Uint8Array): Promise<void> {
  if (invoice.emailed_at || !invoice.customer_email) return;

  let isClaimed = false;
  let isSent = false;
  try {
    const claim = await supabaseRest<Array<{ id: string }>>(
      `invoices?id=eq.${invoice.id}&emailed_at=is.null&select=id`,
      "PATCH",
      { emailed_at: new Date().toISOString() },
      { prefer: "return=representation" }
    );
    if (claim.error) throw new Error(`Could not claim the invoice email: ${JSON.stringify(claim.error)}`);
    // No row: another call already sent it, or is sending it
    isClaimed = Boolean(claim.data?.length);
    if (!isClaimed) return;

    const title = documentTitle(invoice.type);
    isSent = await sendInvoiceEmail({
      to: invoice.customer_email,
      subject: `${seller.name} — ${title} ${invoice.invoice_number} for order ${invoice.order_number}`,
      html: renderInvoiceHtml(invoice, seller),
      pdfBytes: pdfBytes ?? await renderInvoicePdf(invoice, seller),
      pdfFilename: `${invoice.invoice_number}.pdf`,
    });
  } catch (error) {
    console.error(`Invoice email failed for ${invoice.invoice_number} (non-blocking):`, error);
  } finally {
    if (isClaimed && !isSent) {
      await supabaseRest(`invoices?id=eq.${invoice.id}`, "PATCH", { emailed_at: null }).catch(() => {});
    }
  }
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
