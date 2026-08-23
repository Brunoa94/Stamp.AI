import { PDFDocument, PDFFont, PDFImage, PDFPage, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import fontkit from "https://esm.sh/@pdf-lib/fontkit@1.1.1";
import {
  documentTitle,
  formatBillToLines,
  formatInvoiceDate,
  formatMoney,
  InvoiceRowI,
  SellerInfoI,
} from "./invoiceTemplate.ts";
import { INVOICE_LOGO_HEIGHT, INVOICE_LOGO_PNG_BASE64, INVOICE_LOGO_WIDTH } from "./invoiceAssets.ts";
import { INTER_BOLD_TTF_BASE64, INTER_REGULAR_TTF_BASE64 } from "./invoiceFonts.ts";

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;

const COLOR_INK = rgb(0.24, 0.17, 0.12); // chocolate
const COLOR_MUTED = rgb(0.54, 0.48, 0.42); // taupe
const COLOR_ACCENT = rgb(0.7, 0.6, 0.36); // gold
const COLOR_LINE = rgb(0.91, 0.89, 0.85); // divider
const COLOR_CREAM = rgb(0.969, 0.953, 0.925); // header band
const COLOR_PAPER = rgb(1, 1, 1);

const LOGO_WIDTH = 132;
const LOGO_HEIGHT = LOGO_WIDTH * (INVOICE_LOGO_HEIGHT / INVOICE_LOGO_WIDTH);

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

/** Letter-spaced uppercase labels ("BILLED TO", column headers). */
function drawTracked(
  ctx: PdfContextI,
  text: string,
  options: { x: number; size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; tracking?: number; rightAlignAt?: number }
) {
  const font = options.bold ? ctx.fontBold : ctx.font;
  const size = options.size ?? 9;
  const tracking = options.tracking ?? 1.6;
  const chars = [...text];
  const width =
    font.widthOfTextAtSize(text, size) + tracking * Math.max(chars.length - 1, 0);
  let x = options.rightAlignAt !== undefined ? options.rightAlignAt - width : options.x;
  for (const char of chars) {
    ctx.page.drawText(char, { x, y: ctx.y, size, font, color: options.color ?? COLOR_INK });
    x += font.widthOfTextAtSize(char, size) + tracking;
  }
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
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(INTER_REGULAR_TTF_BASE64, { subset: true });
  const fontBold = await doc.embedFont(INTER_BOLD_TTF_BASE64, { subset: true });
  const logo: PDFImage = await doc.embedPng(INVOICE_LOGO_PNG_BASE64);
  const ctx: PdfContextI = { doc, page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]), font, fontBold, y: PAGE_HEIGHT - MARGIN };
  const rightEdge = PAGE_WIDTH - MARGIN;

  doc.setTitle(`${documentTitle(invoice.type)} ${invoice.invoice_number}`);

  const metaLines = [
    `Issued ${formatInvoiceDate(invoice.issued_at)}`,
    `Order ${invoice.order_number}`,
    ...(invoice.payment_method ? [`Paid via ${invoice.payment_method}`] : []),
  ];
  const sellerLines = [
    seller.name,
    ...seller.addressLines,
    seller.email,
    ...(seller.vatId ? [`VAT: ${seller.vatId}`] : []),
  ];

  // Cream header band sized to fit whichever column is taller
  const leftHeight = 44 + LOGO_HEIGHT + 22 + sellerLines.length * 13;
  const rightHeight = 52 + 26 + metaLines.length * 14;
  const headerHeight = Math.max(leftHeight, rightHeight) + 28;
  ctx.page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - headerHeight,
    width: PAGE_WIDTH,
    height: headerHeight,
    color: COLOR_CREAM,
  });
  ctx.page.drawLine({
    start: { x: 0, y: PAGE_HEIGHT - headerHeight },
    end: { x: PAGE_WIDTH, y: PAGE_HEIGHT - headerHeight },
    thickness: 2,
    color: COLOR_ACCENT,
  });

  // Left: wordmark + seller identity
  ctx.page.drawImage(logo, {
    x: MARGIN,
    y: PAGE_HEIGHT - 44 - LOGO_HEIGHT,
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  });
  ctx.y = PAGE_HEIGHT - 44 - LOGO_HEIGHT - 22;
  for (const line of sellerLines) {
    drawText(ctx, line, { x: MARGIN, size: 8.5, color: COLOR_MUTED });
    ctx.y -= 13;
  }

  // Right: document title, number and meta
  ctx.y = PAGE_HEIGHT - 52;
  drawTracked(ctx, documentTitle(invoice.type).toUpperCase(), {
    x: 0,
    size: 10,
    bold: true,
    color: COLOR_ACCENT,
    tracking: 2.4,
    rightAlignAt: rightEdge,
  });
  ctx.y -= 24;
  drawText(ctx, invoice.invoice_number, { x: 0, size: 17, bold: true, rightAlignAt: rightEdge });
  ctx.y -= 20;
  for (const line of metaLines) {
    drawText(ctx, line, { x: 0, size: 8.5, color: COLOR_MUTED, rightAlignAt: rightEdge });
    ctx.y -= 14;
  }

  // Billed to
  ctx.y = PAGE_HEIGHT - headerHeight - 44;
  drawTracked(ctx, "BILLED TO", { x: MARGIN, size: 8.5, bold: true, color: COLOR_ACCENT });
  const billTo = formatBillToLines(invoice);
  for (const line of billTo) {
    ctx.y -= 15;
    drawText(ctx, line, { x: MARGIN, size: 10 });
  }

  // Items table
  const columns = {
    item: MARGIN + 12,
    qty: rightEdge - 190,
    unitPrice: rightEdge - 110,
    amount: rightEdge - 12,
  };

  ctx.y -= 40;
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - 9,
    width: rightEdge - MARGIN,
    height: 26,
    color: COLOR_INK,
  });
  const headerLabel = { size: 8, bold: true, color: COLOR_CREAM, tracking: 1.4 };
  drawTracked(ctx, "ITEM", { ...headerLabel, x: columns.item });
  drawTracked(ctx, "QTY", { ...headerLabel, x: 0, rightAlignAt: columns.qty });
  drawTracked(ctx, "UNIT PRICE", { ...headerLabel, x: 0, rightAlignAt: columns.unitPrice });
  drawTracked(ctx, "AMOUNT", { ...headerLabel, x: 0, rightAlignAt: columns.amount });
  ctx.y -= 9;

  const maxDescriptionWidth = columns.qty - columns.item - 60;
  for (const item of invoice.line_items) {
    ensureSpace(ctx, 44);
    ctx.y -= 22;
    let description = item.variant_name
      ? `${item.product_name} — ${item.variant_name}`
      : item.product_name;
    while (description.length > 3 && font.widthOfTextAtSize(description, 10) > maxDescriptionWidth) {
      description = `${description.slice(0, -4)}…`;
    }
    drawText(ctx, description, { x: columns.item, size: 10 });
    drawText(ctx, String(item.quantity), { x: 0, size: 10, color: COLOR_MUTED, rightAlignAt: columns.qty });
    drawText(ctx, formatMoney(item.unit_price, invoice.currency), { x: 0, size: 10, color: COLOR_MUTED, rightAlignAt: columns.unitPrice });
    drawText(ctx, formatMoney(item.total_price, invoice.currency), { x: 0, size: 10, bold: true, rightAlignAt: columns.amount });
    ctx.y -= 10;
    drawLine(ctx, 0.5);
  }

  // Totals
  const totals: Array<[string, number]> = [
    ["Subtotal", invoice.subtotal],
    ...(invoice.discount_amount > 0 ? [["Discount", -invoice.discount_amount] as [string, number]] : []),
    ["Shipping", invoice.shipping_cost],
    ["Tax", invoice.tax_amount],
  ];
  const totalsLabelX = rightEdge - 210;
  ensureSpace(ctx, totals.length * 18 + 110);
  ctx.y -= 12;
  for (const [label, amount] of totals) {
    ctx.y -= 18;
    drawText(ctx, label, { x: totalsLabelX, size: 10, color: COLOR_MUTED });
    drawText(ctx, formatMoney(amount, invoice.currency), { x: 0, size: 10, rightAlignAt: rightEdge - 12 });
  }

  // Emphasized total on a chocolate band
  ctx.y -= 40;
  ctx.page.drawRectangle({
    x: totalsLabelX - 12,
    y: ctx.y - 10,
    width: rightEdge - totalsLabelX + 12,
    height: 32,
    color: COLOR_INK,
  });
  drawText(ctx, "Total", { x: totalsLabelX, size: 12, bold: true, color: COLOR_CREAM });
  drawText(ctx, formatMoney(invoice.total_amount, invoice.currency), {
    x: 0,
    size: 12,
    bold: true,
    color: COLOR_PAPER,
    rightAlignAt: rightEdge - 12,
  });

  // Footer
  ensureSpace(ctx, 70);
  ctx.y -= 50;
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
