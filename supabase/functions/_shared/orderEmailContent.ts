/**
 * Customer emails sent after checkout: order confirmation and shipping
 * notification. Pure templates (no Deno globals) so vitest can cover them.
 */

import { formatAddressLines, formatMoney } from "./invoiceTemplate.ts";

export interface EmailOrderI {
  order_number: string;
  customer_name: string | null;
  currency: string | null;
  subtotal: number | null;
  discount_amount: number | null;
  shipping_cost: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  shipping_address: Record<string, unknown> | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
}

export interface EmailOrderItemI {
  product_name: string;
  variant_name: string | null;
  quantity: number;
  total_price: number | null;
}

export interface RenderedEmailI {
  subject: string;
  html: string;
  text: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Only web links are put in an href. */
function safeUrl(value: string | null | undefined): string | null {
  return value && /^https?:\/\//i.test(value) ? value : null;
}

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#F1EAE0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#3D2B1F;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#FFFFFF;border-radius:12px;padding:28px;">${body}</div>
  </div>
</body></html>`;
}

function greeting(order: EmailOrderI): string {
  return order.customer_name ? `Hi ${order.customer_name},` : "Hi,";
}

function itemLine(item: EmailOrderItemI): string {
  return `${item.quantity} × ${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ""}`;
}

export function renderOrderConfirmationEmail(order: EmailOrderI, items: EmailOrderItemI[]): RenderedEmailI {
  const currency = order.currency || "EUR";
  const money = (cents: number | null) => formatMoney(cents, currency);
  const totals: Array<[string, string]> = [
    ["Subtotal", money(order.subtotal)],
    ...((order.discount_amount ?? 0) > 0 ? [["Discount", `-${money(order.discount_amount)}`] as [string, string]] : []),
    ["Shipping", money(order.shipping_cost)],
    ...((order.tax_amount ?? 0) > 0 ? [["VAT included", money(order.tax_amount)] as [string, string]] : []),
    ["Total", money(order.total_amount)],
  ];
  const address = formatAddressLines(order.shipping_address);
  const subject = `Your Stamp.AI order ${order.order_number} is confirmed`;

  const html = layout(subject, `
    <h1 style="font-size:20px;margin:0 0 12px;">Thank you for your order</h1>
    <p style="margin:0 0 16px;">${escapeHtml(greeting(order))} we received your payment for order <strong>${escapeHtml(order.order_number)}</strong> and are preparing it for production.</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
      ${items.map((item) => `<tr><td style="padding:8px 0;border-bottom:1px solid #E8E2D9;">${escapeHtml(itemLine(item))}</td><td style="padding:8px 0;border-bottom:1px solid #E8E2D9;text-align:right;">${escapeHtml(money(item.total_price))}</td></tr>`).join("")}
      ${totals.map(([label, value]) => `<tr><td style="padding:4px 0;color:#8A7B6C;">${escapeHtml(label)}</td><td style="padding:4px 0;text-align:right;">${escapeHtml(value)}</td></tr>`).join("")}
    </table>
    ${address.length ? `<p style="margin:0 0 4px;color:#8A7B6C;">Shipping to</p><p style="margin:0 0 16px;">${address.map(escapeHtml).join("<br>")}</p>` : ""}
    <p style="margin:0;">We will email you again as soon as your order ships. Your invoice is sent separately.</p>`);

  const text = [
    "Thank you for your order",
    "",
    `${greeting(order)} we received your payment for order ${order.order_number} and are preparing it for production.`,
    "",
    ...items.map((item) => `${itemLine(item)}  ${money(item.total_price)}`),
    "",
    ...totals.map(([label, value]) => `${label}: ${value}`),
    ...(address.length ? ["", "Shipping to:", ...address] : []),
    "",
    "We will email you again as soon as your order ships. Your invoice is sent separately.",
  ].join("\n");

  return { subject, html, text };
}

export function renderShippingNotificationEmail(order: EmailOrderI): RenderedEmailI {
  const trackingUrl = safeUrl(order.tracking_url);
  const subject = `Your Stamp.AI order ${order.order_number} has shipped`;
  const trackingLine = order.tracking_number ? `Tracking number: ${order.tracking_number}` : "";

  const html = layout(subject, `
    <h1 style="font-size:20px;margin:0 0 12px;">Your order is on its way</h1>
    <p style="margin:0 0 16px;">${escapeHtml(greeting(order))} order <strong>${escapeHtml(order.order_number)}</strong> has been handed to the carrier.</p>
    ${trackingLine ? `<p style="margin:0 0 16px;">${escapeHtml(trackingLine)}</p>` : ""}
    ${trackingUrl ? `<p style="margin:0;"><a href="${escapeHtml(trackingUrl)}" style="color:#3D2B1F;font-weight:700;">Track your package</a></p>` : ""}`);

  const text = [
    "Your order is on its way",
    "",
    `${greeting(order)} order ${order.order_number} has been handed to the carrier.`,
    ...(trackingLine ? ["", trackingLine] : []),
    ...(trackingUrl ? [`Track your package: ${trackingUrl}`] : []),
  ].join("\n");

  return { subject, html, text };
}
