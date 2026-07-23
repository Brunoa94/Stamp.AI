import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import {
  documentTitle,
  formatAddressLines,
  formatInvoiceDate,
  formatMoney,
  InvoiceRowI,
  SellerInfoI,
} from "./invoiceTemplate.ts";

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;

const COLOR_INK = rgb(0.24, 0.17, 0.12); // chocolate
const COLOR_MUTED = rgb(0.54, 0.48, 0.42); // taupe
const COLOR_ACCENT = rgb(0.7, 0.6, 0.36); // gold
const COLOR_LINE = rgb(0.91, 0.89, 0.85); // divider

interface PdfContextI {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  y: number;
}

function addPage(ctx: PdfContextI) {
  ctx.page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.y = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(ctx: PdfContextI, needed: number) {
  if (ctx.y - needed < MARGIN) {
    addPage(ctx);
  }
}

function drawText(
  ctx: PdfContextI,
  text: string,
  options: { x: number; size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; rightAlignAt?: number }
) {
  const font = options.bold ? ctx.fontBold : ctx.font;
  const size = options.size ?? 10;
  let x = options.x;
  if (options.rightAlignAt !== undefined) {
    x = options.rightAlignAt - font.widthOfTextAtSize(text, size);
  }
  ctx.page.drawText(text, {
    x,
    y: ctx.y,
    size,
    font,
    color: options.color ?? COLOR_INK,
  });
}

function drawLine(ctx: PdfContextI, thickness: number, color = COLOR_LINE) {
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: PAGE_WIDTH - MARGIN, y: ctx.y },
    thickness,
    color,
  });
}

/**
 * Render an invoice/credit note as an A4 PDF.
 * The layout mirrors renderInvoiceHtml in invoiceTemplate.ts.
 */
export async function renderInvoicePdf(invoice: InvoiceRowI, seller: SellerInfoI): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ctx: PdfContextI = { doc, page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]), font, fontBold, y: PAGE_HEIGHT - MARGIN };
  const rightEdge = PAGE_WIDTH - MARGIN;

  doc.setTitle(`${documentTitle(invoice.type)} ${invoice.invoice_number}`);

  // Header: seller (left) and document meta (right)
  drawText(ctx, seller.name, { x: MARGIN, size: 20, bold: true });
  drawText(ctx, documentTitle(invoice.type).toUpperCase(), {
    x: MARGIN,
    size: 12,
    bold: true,
    color: COLOR_ACCENT,
    rightAlignAt: rightEdge,
  });
  ctx.y -= 18;
  drawText(ctx, invoice.invoice_number, { x: MARGIN, size: 14, bold: true, rightAlignAt: rightEdge });

  const metaLines = [
    `Issued: ${formatInvoiceDate(invoice.issued_at)}`,
    `Order: ${invoice.order_number}`,
    ...(invoice.payment_method ? [`Paid via ${invoice.payment_method}`] : []),
  ];
  const sellerLines = [
    ...seller.addressLines,
    seller.email,
    ...(seller.vatId ? [`VAT: ${seller.vatId}`] : []),
  ];
  for (let i = 0; i < Math.max(sellerLines.length, metaLines.length); i++) {
    ctx.y -= 14;
    if (sellerLines[i]) drawText(ctx, sellerLines[i], { x: MARGIN, size: 9, color: COLOR_MUTED });
    if (metaLines[i]) drawText(ctx, metaLines[i], { x: MARGIN, size: 9, color: COLOR_MUTED, rightAlignAt: rightEdge });
  }

  // Billed to
  ctx.y -= 36;
  drawText(ctx, "BILLED TO", { x: MARGIN, size: 9, bold: true, color: COLOR_ACCENT });
  ctx.y -= 6;
  drawLine(ctx, 0.5);
  const billTo = [
    invoice.customer_name || "",
    ...formatAddressLines(invoice.billing_address ?? invoice.shipping_address),
    invoice.customer_email,
  ].filter(Boolean);
  for (const line of billTo) {
    ctx.y -= 14;
    drawText(ctx, line, { x: MARGIN, size: 10 });
  }

  // Items table
  const columns = {
    item: MARGIN,
    qty: rightEdge - 190,
    unitPrice: rightEdge - 110,
    amount: rightEdge,
  };

  ctx.y -= 32;
  drawText(ctx, "ITEM", { x: columns.item, size: 9, bold: true, color: COLOR_ACCENT });
  drawText(ctx, "QTY", { x: 0, size: 9, bold: true, color: COLOR_ACCENT, rightAlignAt: columns.qty });
  drawText(ctx, "UNIT PRICE", { x: 0, size: 9, bold: true, color: COLOR_ACCENT, rightAlignAt: columns.unitPrice });
  drawText(ctx, "AMOUNT", { x: 0, size: 9, bold: true, color: COLOR_ACCENT, rightAlignAt: columns.amount });
  ctx.y -= 8;
  drawLine(ctx, 1.2, COLOR_INK);

  const maxDescriptionWidth = columns.qty - columns.item - 60;
  for (const item of invoice.line_items) {
    ensureSpace(ctx, 40);
    ctx.y -= 18;
    let description = item.variant_name
      ? `${item.product_name} — ${item.variant_name}`
      : item.product_name;
    while (description.length > 3 && font.widthOfTextAtSize(description, 10) > maxDescriptionWidth) {
      description = `${description.slice(0, -4)}…`;
    }
    drawText(ctx, description, { x: columns.item, size: 10 });
    drawText(ctx, String(item.quantity), { x: 0, size: 10, rightAlignAt: columns.qty });
    drawText(ctx, formatMoney(item.unit_price, invoice.currency), { x: 0, size: 10, rightAlignAt: columns.unitPrice });
    drawText(ctx, formatMoney(item.total_price, invoice.currency), { x: 0, size: 10, rightAlignAt: columns.amount });
    ctx.y -= 8;
    drawLine(ctx, 0.5);
  }

  // Totals
  const totals: Array<[string, number, boolean]> = [
    ["Subtotal", invoice.subtotal, false],
    ...(invoice.discount_amount > 0 ? [["Discount", -invoice.discount_amount, false] as [string, number, boolean]] : []),
    ["Shipping", invoice.shipping_cost, false],
    ["Tax", invoice.tax_amount, false],
    ["Total", invoice.total_amount, true],
  ];
  const totalsLabelX = rightEdge - 200;
  ensureSpace(ctx, totals.length * 18 + 60);
  ctx.y -= 10;
  for (const [label, amount, emphasize] of totals) {
    ctx.y -= 18;
    if (emphasize) {
      ctx.y += 6;
      ctx.page.drawLine({
        start: { x: totalsLabelX, y: ctx.y + 12 },
        end: { x: rightEdge, y: ctx.y + 12 },
        thickness: 1.2,
        color: COLOR_INK,
      });
      ctx.y -= 6;
    }
    drawText(ctx, label, {
      x: totalsLabelX,
      size: emphasize ? 12 : 10,
      bold: emphasize,
      color: emphasize ? COLOR_INK : COLOR_MUTED,
    });
    drawText(ctx, formatMoney(amount, invoice.currency), {
      x: 0,
      size: emphasize ? 12 : 10,
      bold: emphasize,
      rightAlignAt: rightEdge,
    });
  }

  // Footer
  ensureSpace(ctx, 60);
  ctx.y -= 40;
  drawLine(ctx, 0.5);
  ctx.y -= 16;
  const footer = `Thank you for your order. This ${documentTitle(invoice.type).toLowerCase()} was generated automatically for order ${invoice.order_number}.`;
  drawText(ctx, footer, { x: MARGIN, size: 8, color: COLOR_MUTED });
  if (invoice.tax_amount === 0) {
    ctx.y -= 12;
    drawText(ctx, "No tax has been charged on this order.", { x: MARGIN, size: 8, color: COLOR_MUTED });
  }

  return await doc.save();
}
