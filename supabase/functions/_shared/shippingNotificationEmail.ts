/**
 * Shipping notification email — pure template builder.
 *
 * Sent by sync-printify-orders the first time Printify reports a tracking
 * number for an order (see isFirstTrackingAppearance + orderEmails.ts).
 */

import { escapeHtml } from './emailFormatting.ts'
import { buttonRow, greeting, paragraphRow, renderEmailShell } from './orderConfirmationEmail.ts'
import type { EmailSellerI, OrderEmailOrderI, RenderedEmailI } from './orderConfirmationEmail.ts'

export interface ShippingNotificationEmailInputI {
  order: OrderEmailOrderI
  trackingNumber: string
  trackingUrl?: string | null
  carrier?: string | null
  seller: EmailSellerI
  orderUrl?: string
}

/** Minimal shape of the sync diff this module needs (see sync-printify-orders/mapping.ts). */
export interface TrackingUpdateI {
  tracking_number?: string
  tracking_url?: string
}

/**
 * True when the sync update adds a tracking number to an order that never
 * had one — the moment the customer should be told the order shipped.
 */
export function isFirstTrackingAppearance(
  previousTrackingNumber: string | null | undefined,
  update: TrackingUpdateI | null | undefined,
): boolean {
  return Boolean(update?.tracking_number) && !previousTrackingNumber
}

export function buildShippingNotificationEmail(input: ShippingNotificationEmailInputI): RenderedEmailI {
  const { order, trackingNumber, trackingUrl, carrier, seller, orderUrl } = input
  const subject = `${seller.name} — Your order ${order.order_number} has shipped`

  const carrierText = carrier ? ` with ${escapeHtml(carrier)}` : ''

  const rows = [
    paragraphRow(greeting(order.customer_name)),
    paragraphRow(
      `Good news — your order <strong>${escapeHtml(order.order_number)}</strong> is on its way${carrierText}.`,
    ),
    paragraphRow(
      `<strong>Tracking number</strong><br /><span style="font-size: 18px; letter-spacing: 1px;">${escapeHtml(trackingNumber)}</span>`,
    ),
    trackingUrl ? buttonRow(trackingUrl, 'Track your package') : '',
    orderUrl
      ? paragraphRow(
          `You can also follow the status on your <a href="${escapeHtml(orderUrl)}" style="color: #b9932f;">orders page</a>.`,
          'font-size: 14px;',
        )
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  const text = [
    greeting(order.customer_name).replace(/&#x27;/g, "'"),
    '',
    `Good news — your order ${order.order_number} is on its way${carrier ? ` with ${carrier}` : ''}.`,
    '',
    `Tracking number: ${trackingNumber}`,
    trackingUrl ? `Track your package: ${trackingUrl}` : null,
    orderUrl ? `Your orders: ${orderUrl}` : null,
    '',
    `Questions? Write to ${seller.supportEmail}.`,
  ]
    .filter((line) => line !== null)
    .join('\n')

  return { subject, html: renderEmailShell(seller, rows), text }
}
