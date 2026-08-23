/**
 * Invoice template — shared between the PDF renderer and the invoice email.
 *
 * Seller identity is configured through edge function secrets:
 *   INVOICE_SELLER_NAME     e.g. "Stamp.AI"
 *   INVOICE_SELLER_ADDRESS  newline-separated address lines
 *   INVOICE_SELLER_EMAIL    support/billing contact shown on the invoice
 *   INVOICE_SELLER_VAT_ID   optional VAT/tax registration number
 */

import { getInvoiceLogoUrl } from "./invoiceAssets.ts";

export interface InvoiceLineItemI {
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface InvoiceRowI {
  id: string;
  invoice_number: string;
  type: "invoice" | "credit_note";
  status: string;
  order_id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string | null;
  billing_address: Record<string, unknown> | null;
  shipping_address: Record<string, unknown> | null;
  currency: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  line_items: InvoiceLineItemI[];
  payment_method: string | null;
  payment_provider: string | null;
  pdf_bucket: string | null;
  pdf_path: string | null;
  emailed_at: string | null;
  issued_at: string;
}

export interface SellerInfoI {
  name: string;
  addressLines: string[];
  email: string;
  vatId: string | null;
}

export function getSellerInfo(): SellerInfoI {
  return {
    name: Deno.env.get("INVOICE_SELLER_NAME") || "Stamp.AI",
    addressLines: (Deno.env.get("INVOICE_SELLER_ADDRESS") || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    email: Deno.env.get("INVOICE_SELLER_EMAIL") || "support@stamp.ai",
    vatId: Deno.env.get("INVOICE_SELLER_VAT_ID") || null,
  };
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  DKK: "kr ",
  SEK: "kr ",
  NOK: "kr ",
};

export function formatMoney(amount: number | null | undefined, currency: string): string {
  const value = amount ?? 0;
  const code = (currency || "USD").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code];
  return symbol ? `${symbol}${value.toFixed(2)}` : `${value.toFixed(2)} ${code}`;
}

export function formatInvoiceDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Flatten a checkout address (shipping/billing JSONB) into printable lines.
 * Tolerates both snake_case checkout fields and missing data.
 */
export function formatAddressLines(address: Record<string, unknown> | null): string[] {
  if (!address) return [];

  const get = (...keys: string[]): string => {
    for (const key of keys) {
      const value = address[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
  };

  const name = [get("first_name", "firstName"), get("last_name", "lastName")]
    .filter(Boolean)
    .join(" ");
  const cityLine = [get("zip", "postal_code", "zipCode"), get("city")]
    .filter(Boolean)
    .join(" ");

  return [
    name,
    get("address1", "address_line1", "street"),
    get("address2", "address_line2"),
    cityLine,
    [get("region", "state"), get("country", "country_code")].filter(Boolean).join(", "),
  ].filter(Boolean);
}

/**
 * Printable "billed to" lines: customer name, address and email, without
 * repeating the name when the address already starts with it.
 */
export function formatBillToLines(invoice: InvoiceRowI): string[] {
  const addressLines = formatAddressLines(invoice.billing_address ?? invoice.shipping_address);
  const name = (invoice.customer_name || "").trim();
  if (name && addressLines[0]?.trim().toLowerCase() === name.toLowerCase()) {
    addressLines.shift();
  }
  return [name, ...addressLines, invoice.customer_email].filter(Boolean);
}

export function documentTitle(type: InvoiceRowI["type"]): string {
  return type === "credit_note" ? "Credit Note" : "Invoice";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Render the invoice as a self-contained HTML document.
 * Used as the email body; the PDF layout mirrors this structure.
 */
export function renderInvoiceHtml(invoice: InvoiceRowI, seller: SellerInfoI): string {
  const title = documentTitle(invoice.type);
  const logoUrl = getInvoiceLogoUrl();
  const billTo = formatBillToLines(invoice);
  const sellerLines = [
    seller.name,
    ...seller.addressLines,
    seller.email,
    ...(seller.vatId ? [`VAT: ${seller.vatId}`] : []),
  ];

  const sectionLabel = (label: string) =>
    `<div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#B39A5B;font-weight:700;margin-bottom:10px;">${escapeHtml(label)}</div>`;

  const itemRows = invoice.line_items
    .map((item) => {
      const description = item.variant_name
        ? `${item.product_name} — ${item.variant_name}`
        : item.product_name;
      return `
        <tr>
          <td style="padding:14px 12px;border-bottom:1px solid #E8E2D9;">${escapeHtml(description)}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #E8E2D9;text-align:center;color:#8A7B6C;">${item.quantity}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #E8E2D9;text-align:right;color:#8A7B6C;">${formatMoney(item.unit_price, invoice.currency)}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #E8E2D9;text-align:right;font-weight:700;">${formatMoney(item.total_price, invoice.currency)}</td>
        </tr>`;
    })
    .join("");

  const totalRow = (label: string, amount: number) => `
    <tr>
      <td style="padding:6px 12px;color:#8A7B6C;">${label}</td>
      <td style="padding:6px 12px;text-align:right;color:#3D2B1F;">${formatMoney(amount, invoice.currency)}</td>
    </tr>`;

  const optionalTotals = [
    invoice.discount_amount > 0 ? totalRow("Discount", -invoice.discount_amount) : "",
    totalRow("Shipping", invoice.shipping_cost),
    totalRow("Tax", invoice.tax_amount),
  ].join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${escapeHtml(title)} ${escapeHtml(invoice.invoice_number)}</title></head>
<body style="margin:0;padding:0;background:#F1EAE0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#3D2B1F;">
  <div style="max-width:640px;margin:0 auto;padding:40px 16px;">
    <div style="background:#FFFFFF;border:1px solid #E8E2D9;border-radius:16px;overflow:hidden;">

      <div style="background:#F7F3EC;padding:36px 48px;border-bottom:2px solid #B39A5B;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:middle;">
              <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(seller.name)}" width="150" style="display:block;max-width:150px;height:auto;">
            </td>
            <td style="vertical-align:middle;text-align:right;">
              <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#B39A5B;font-weight:700;">${escapeHtml(title)}</div>
              <div style="font-size:20px;font-weight:700;margin-top:6px;">${escapeHtml(invoice.invoice_number)}</div>
              <div style="font-size:12px;color:#8A7B6C;margin-top:10px;line-height:1.7;">
                Issued ${escapeHtml(formatInvoiceDate(invoice.issued_at))}<br>
                Order ${escapeHtml(invoice.order_number)}
                ${invoice.payment_method ? `<br>Paid via ${escapeHtml(invoice.payment_method)}` : ""}
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div style="padding:40px 48px;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:36px;">
          <tr>
            <td style="vertical-align:top;width:50%;padding-right:16px;">
              ${sectionLabel("Billed To")}
              <div style="font-size:13px;line-height:1.8;">${billTo.map(escapeHtml).join("<br>")}</div>
            </td>
            <td style="vertical-align:top;width:50%;padding-left:16px;">
              ${sectionLabel("From")}
              <div style="font-size:13px;line-height:1.8;color:#8A7B6C;">${sellerLines.map(escapeHtml).join("<br>")}</div>
            </td>
          </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#3D2B1F;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#F7F3EC;">
              <th style="text-align:left;padding:10px 12px;border-radius:8px 0 0 8px;">Item</th>
              <th style="text-align:center;padding:10px 12px;">Qty</th>
              <th style="text-align:right;padding:10px 12px;">Unit Price</th>
              <th style="text-align:right;padding:10px 12px;border-radius:0 8px 8px 0;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <table style="width:300px;margin-left:auto;margin-top:24px;border-collapse:collapse;font-size:13px;">
          ${totalRow("Subtotal", invoice.subtotal)}
          ${optionalTotals}
          <tr>
            <td style="padding:12px;background:#3D2B1F;color:#F7F3EC;font-weight:700;font-size:15px;border-radius:8px 0 0 8px;">Total</td>
            <td style="padding:12px;background:#3D2B1F;color:#FFFFFF;font-weight:700;font-size:15px;text-align:right;border-radius:0 8px 8px 0;">${formatMoney(invoice.total_amount, invoice.currency)}</td>
          </tr>
        </table>

        <div style="margin-top:44px;padding-top:16px;border-top:1px solid #E8E2D9;font-size:11px;color:#8A7B6C;line-height:1.7;">
          Thank you for your order. This ${escapeHtml(title.toLowerCase())} was generated automatically for order ${escapeHtml(invoice.order_number)}.
          ${invoice.tax_amount === 0 ? "No tax has been charged on this order." : ""}
        </div>
      </div>
    </div>

    <div style="text-align:center;font-size:11px;color:#8A7B6C;margin-top:16px;">
      ${escapeHtml(seller.name)} · ${escapeHtml(seller.email)}
    </div>
  </div>
</body>
</html>`;
}
