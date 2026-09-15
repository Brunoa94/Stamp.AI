/**
 * Customer order emails (Deno glue).
 *
 * - `trySendOrderConfirmationEmail(orderId)` — call wherever an order
 *   transitions to payment_status = 'paid' (payment webhooks, capture/verify
 *   endpoints). Idempotent via orders.confirmation_email_sent_at.
 * - `trySendShippingNotificationEmail(orderId, tracking)` — called by
 *   sync-printify-orders when a tracking number first appears. Idempotent via
 *   orders.shipping_email_sent_at.
 *
 * Both are best-effort: they never throw, so a failed email can never fail a
 * payment webhook (providers would retry the whole event). Failures are
 * reported to Sentry and the sent-at claim is released so a later call can
 * retry. Templates are pure and tested (orderConfirmationEmail.ts,
 * shippingNotificationEmail.ts).
 */

import { supabaseRest } from './supabase.ts'
import { sendBrevoEmail } from './brevoEmail.ts'
import { captureException } from './sentry.ts'
import { buildOrderConfirmationEmail } from './orderConfirmationEmail.ts'
import type { EmailSellerI, OrderEmailItemI, OrderEmailOrderI, RenderedEmailI } from './orderConfirmationEmail.ts'
import { buildShippingNotificationEmail } from './shippingNotificationEmail.ts'

type SentAtColumnT = 'confirmation_email_sent_at' | 'shipping_email_sent_at'

const ORDER_SELECT =
  'id,order_number,customer_name,customer_email,currency,subtotal,shipping_cost,discount_amount,tax_amount,total_amount,shipping_address,created_at'

function getSeller(): EmailSellerI {
  return {
    name: Deno.env.get('BREVO_FROM_NAME') || Deno.env.get('INVOICE_SELLER_NAME') || 'Stamp.AI',
    supportEmail: Deno.env.get('SUPPORT_EMAIL') || Deno.env.get('INVOICE_SELLER_EMAIL') || 'support@stamp.ai',
  }
}

function getOrdersPageUrl(): string {
  const siteUrl = (Deno.env.get('SITE_URL') || 'http://localhost:3000').replace(/\/$/, '')
  return `${siteUrl}/orders`
}

/**
 * Atomically claim the send: PATCH only matches when the column is still
 * null, so concurrent webhooks (Stripe retries, verify + webhook races) get
 * an empty result and skip. Returns the order row when this caller won.
 */
async function claimEmailSend(
  orderId: string,
  column: SentAtColumnT,
  extraFilter = '',
): Promise<OrderEmailOrderI | null> {
  const result = await supabaseRest<OrderEmailOrderI[]>(
    `orders?id=eq.${encodeURIComponent(orderId)}&${column}=is.null${extraFilter}&select=${ORDER_SELECT}`,
    'PATCH',
    { [column]: new Date().toISOString() },
    { prefer: 'return=representation' },
  )

  if (result.error) {
    throw new Error(`Failed to claim ${column} for order ${orderId}: ${JSON.stringify(result.error)}`)
  }

  return result.data?.[0] ?? null
}

async function releaseEmailClaim(orderId: string, column: SentAtColumnT): Promise<void> {
  const result = await supabaseRest(`orders?id=eq.${encodeURIComponent(orderId)}`, 'PATCH', {
    [column]: null,
  })
  if (result.error) {
    console.error(`Failed to release ${column} for order ${orderId}:`, result.error)
  }
}

async function fetchOrderItems(orderId: string): Promise<OrderEmailItemI[]> {
  const result = await supabaseRest<OrderEmailItemI[]>(
    `order_items?order_id=eq.${encodeURIComponent(orderId)}&select=product_name,variant_name,quantity,unit_price,total_price&order=created_at.asc`,
    'GET',
  )
  if (result.error) {
    throw new Error(`Failed to load order items for ${orderId}: ${JSON.stringify(result.error)}`)
  }
  return result.data ?? []
}

async function deliver(order: OrderEmailOrderI, email: RenderedEmailI): Promise<boolean> {
  if (!order.customer_email) {
    console.warn(`Order ${order.id} has no customer_email, skipping "${email.subject}"`)
    return false
  }
  return await sendBrevoEmail({
    to: order.customer_email,
    subject: email.subject,
    htmlContent: email.html,
    textContent: email.text,
  })
}

/**
 * Send the order confirmation once the order is paid. Safe to call from every
 * "order became paid" code path; only the first caller sends.
 */
export async function trySendOrderConfirmationEmail(orderId: string | null | undefined): Promise<void> {
  if (!orderId) return
  const column: SentAtColumnT = 'confirmation_email_sent_at'
  let claimed = false

  try {
    const order = await claimEmailSend(orderId, column, '&payment_status=eq.paid')
    if (!order) return
    claimed = true

    const items = await fetchOrderItems(orderId)
    const email = buildOrderConfirmationEmail({
      order,
      items,
      seller: getSeller(),
      orderUrl: getOrdersPageUrl(),
    })

    const sent = await deliver(order, email)
    if (!sent) {
      await releaseEmailClaim(orderId, column)
      return
    }
    console.log(`✅ Order confirmation email sent for order ${order.order_number}`)
  } catch (error) {
    console.error(`Order confirmation email failed for order ${orderId} (non-blocking):`, error)
    captureException(error, { extra: { order_id: orderId, email: 'order_confirmation' } })
    if (claimed) await releaseEmailClaim(orderId, column).catch(() => undefined)
  }
}

export interface ShippingTrackingI {
  trackingNumber: string
  trackingUrl?: string | null
  carrier?: string | null
}

/**
 * Send the shipping notification the first time a tracking number appears.
 */
export async function trySendShippingNotificationEmail(
  orderId: string,
  tracking: ShippingTrackingI,
): Promise<void> {
  const column: SentAtColumnT = 'shipping_email_sent_at'
  let claimed = false

  try {
    const order = await claimEmailSend(orderId, column)
    if (!order) return
    claimed = true

    const email = buildShippingNotificationEmail({
      order,
      trackingNumber: tracking.trackingNumber,
      trackingUrl: tracking.trackingUrl,
      carrier: tracking.carrier,
      seller: getSeller(),
      orderUrl: getOrdersPageUrl(),
    })

    const sent = await deliver(order, email)
    if (!sent) {
      await releaseEmailClaim(orderId, column)
      return
    }
    console.log(`✅ Shipping notification email sent for order ${order.order_number}`)
  } catch (error) {
    console.error(`Shipping notification email failed for order ${orderId} (non-blocking):`, error)
    captureException(error, { extra: { order_id: orderId, email: 'shipping_notification' } })
    if (claimed) await releaseEmailClaim(orderId, column).catch(() => undefined)
  }
}
