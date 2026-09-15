/**
 * Order confirmation email — pure template builder.
 *
 * Sent once when an order's payment is confirmed (see orderEmails.ts).
 * Inline hex values mirror the stamp brand tokens (chocolate #3d2817,
 * gold #b9932f, cream #faf6f1, off-white #fefefe) — email clients cannot
 * resolve CSS custom properties.
 */

import { escapeHtml, firstNameOf, formatAddressLines, formatMoney } from './emailFormatting.ts'

export interface OrderEmailOrderI {
  id: string
  order_number: string
  customer_name: string | null
  customer_email: string
  currency: string | null
  subtotal: number | null
  shipping_cost: number | null
  discount_amount: number | null
  tax_amount: number | null
  total_amount: number | null
  shipping_address: Record<string, unknown> | null
  created_at: string | null
}

export interface OrderEmailItemI {
  product_name: string
  variant_name: string | null
  quantity: number
  unit_price: number | null
  total_price: number | null
}

export interface EmailSellerI {
  name: string
  supportEmail: string
}

export interface OrderConfirmationEmailInputI {
  order: OrderEmailOrderI
  items: OrderEmailItemI[]
  seller: EmailSellerI
  /** Link to the customer's orders page; omitted when unknown. */
  orderUrl?: string
}

export interface RenderedEmailI {
  subject: string
  html: string
  text: string
}

const BODY_STYLE =
  "margin: 0; padding: 0; background-color: #faf6f1; font-family: Georgia, 'Times New Roman', serif; color: #3d2817;"
const CARD_STYLE =
  'max-width: 560px; background-color: #fefefe; border: 2px solid rgba(61, 40, 23, 0.12); padding: 40px;'
const MUTED = 'color: #8a6d5a;'
const BUTTON_STYLE =
  'display: inline-block; background-color: #b9932f; color: #fefefe; text-decoration: none; font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; padding: 14px 32px;'

export function renderEmailShell(seller: EmailSellerI, bodyRows: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="${BODY_STYLE}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf6f1; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${CARD_STYLE}">
            <tr>
              <td style="padding-bottom: 24px; font-size: 22px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">
                ${escapeHtml(seller.name)}
              </td>
            </tr>
${bodyRows}
            <tr>
              <td style="border-top: 1px solid rgba(61, 40, 23, 0.12); padding-top: 24px; font-size: 12px; line-height: 1.6; ${MUTED}">
                Questions about your order? Reply to this email or write to
                <a href="mailto:${escapeHtml(seller.supportEmail)}" style="color: #b9932f;">${escapeHtml(seller.supportEmail)}</a>.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function paragraphRow(content: string, extraStyle = ''): string {
  return `            <tr>
              <td style="padding-bottom: 16px; font-size: 16px; line-height: 1.6; ${extraStyle}">
                ${content}
              </td>
            </tr>`
}

export function buttonRow(href: string, label: string): string {
  return `            <tr>
              <td style="padding-bottom: 24px;">
                <a href="${escapeHtml(href)}" style="${BUTTON_STYLE}">${escapeHtml(label)}</a>
              </td>
            </tr>`
}

export function greeting(customerName: string | null | undefined): string {
  const firstName = firstNameOf(customerName)
  return firstName ? `Hi ${escapeHtml(firstName)},` : 'Hi,'
}

function itemLabel(item: OrderEmailItemI): string {
  return item.variant_name ? `${item.product_name} (${item.variant_name})` : item.product_name
}

function itemsTable(items: OrderEmailItemI[], currency: string | null): string {
  const rows = items
    .map(
      (item) => `                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid rgba(61, 40, 23, 0.08); font-size: 14px;">
                      ${escapeHtml(item.product_name)}${
        item.variant_name
          ? `<br /><span style="font-size: 12px; ${MUTED}">${escapeHtml(item.variant_name)}</span>`
          : ''
      }
                    </td>
                    <td align="right" style="padding: 8px 0; border-bottom: 1px solid rgba(61, 40, 23, 0.08); font-size: 14px; white-space: nowrap;">
                      × ${item.quantity} &nbsp; ${formatMoney(item.total_price, currency)}
                    </td>
                  </tr>`,
    )
    .join('\n')

  return `            <tr>
              <td style="padding-bottom: 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${rows}
                </table>
              </td>
            </tr>`
}

function totalsRows(order: OrderEmailOrderI): string {
  const currency = order.currency
  const line = (label: string, value: string, bold = false): string =>
    `                  <tr>
                    <td style="padding: 4px 0; font-size: 14px; ${bold ? 'font-weight: bold;' : MUTED}">${label}</td>
                    <td align="right" style="padding: 4px 0; font-size: 14px; ${bold ? 'font-weight: bold;' : ''}">${value}</td>
                  </tr>`

  const lines = [line('Subtotal', formatMoney(order.subtotal, currency))]
  lines.push(line('Shipping', formatMoney(order.shipping_cost, currency)))
  if (order.discount_amount) lines.push(line('Discount', `-${formatMoney(order.discount_amount, currency)}`))
  if (order.tax_amount) lines.push(line('Tax', formatMoney(order.tax_amount, currency)))
  lines.push(line('Total', formatMoney(order.total_amount, currency), true))

  return `            <tr>
              <td style="padding-bottom: 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${lines.join('\n')}
                </table>
              </td>
            </tr>`
}

function addressRow(address: Record<string, unknown> | null): string {
  const lines = formatAddressLines(address)
  if (lines.length === 0) return ''
  return paragraphRow(
    `<strong>Shipping to</strong><br />${lines.map(escapeHtml).join('<br />')}`,
    'font-size: 14px;',
  )
}

export function buildOrderConfirmationEmail(input: OrderConfirmationEmailInputI): RenderedEmailI {
  const { order, items, seller, orderUrl } = input
  const subject = `${seller.name} — Order ${order.order_number} confirmed`

  const rows = [
    paragraphRow(greeting(order.customer_name)),
    paragraphRow(
      `Thank you for your order. We've received your payment for order <strong>${escapeHtml(order.order_number)}</strong> and are getting it ready for production. You'll get another email with tracking details as soon as it ships.`,
    ),
    itemsTable(items, order.currency),
    totalsRows(order),
    addressRow(order.shipping_address),
    orderUrl ? buttonRow(orderUrl, 'View my orders') : '',
  ]
    .filter(Boolean)
    .join('\n')

  const textItems = items
    .map((item) => `- ${itemLabel(item)} × ${item.quantity} — ${formatMoney(item.total_price, order.currency)}`)
    .join('\n')
  const addressLines = formatAddressLines(order.shipping_address)

  const text = [
    `${greeting(order.customer_name).replace(/&#x27;/g, "'")}`,
    '',
    `Thank you for your order. We've received your payment for order ${order.order_number} and are getting it ready for production. You'll get another email with tracking details as soon as it ships.`,
    '',
    textItems,
    '',
    `Subtotal: ${formatMoney(order.subtotal, order.currency)}`,
    `Shipping: ${formatMoney(order.shipping_cost, order.currency)}`,
    order.discount_amount ? `Discount: -${formatMoney(order.discount_amount, order.currency)}` : null,
    order.tax_amount ? `Tax: ${formatMoney(order.tax_amount, order.currency)}` : null,
    `Total: ${formatMoney(order.total_amount, order.currency)}`,
    '',
    addressLines.length ? `Shipping to:\n${addressLines.join('\n')}` : null,
    orderUrl ? `\nView your orders: ${orderUrl}` : null,
    '',
    `Questions? Write to ${seller.supportEmail}.`,
  ]
    .filter((line) => line !== null)
    .join('\n')

  return { subject, html: renderEmailShell(seller, rows), text }
}
