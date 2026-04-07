import { supabaseRest } from './supabase.ts'
import { validateEnvVars } from './validators.ts'
import { paypalRequest } from './paypal.ts'
import { mollieRequest } from './mollie.ts'

export type PaymentProvider = 'stripe' | 'paypal' | 'mollie'

interface OrderRow {
  id: string
  user_id: string
  status: string | null
  payment_status: string | null
  payment_method: string | null
  customer_email: string
  order_number: string
  total_amount: number | null
  currency: string | null
  printify_order_id: string | null
  stripe_payment_intent_id: string | null
  refund_failed?: boolean | null
}

interface PaymentReferencePayload {
  stripe_payment_intent_id?: string
  stripe_customer_id?: string | null
  paypal_order_id?: string
  paypal_capture_id?: string
  mollie_payment_id?: string
}

interface MarkOrderPaidInput {
  provider: PaymentProvider
  eventId: string
  orderId: string
  amount: number
  currency: string
  userId?: string
  metadata?: Record<string, unknown>
  refs?: PaymentReferencePayload
}

interface ProcessPaidOrderInput {
  provider: PaymentProvider
  eventId: string
  orderId: string
  amount: number
  currency: string
  lineItems: unknown[]
  shippingAddress: Record<string, unknown>
  userId?: string
  metadata?: Record<string, unknown>
  refs?: PaymentReferencePayload
}

interface CancelOrderInput {
  orderId: string
  requestedBy?: string
}

const EMAIL_FROM_FALLBACK = 'orders@stampai.local'

function toJsonRecord(input: unknown): Record<string, unknown> {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    return input as Record<string, unknown>
  }
  return {}
}

function parseError(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return 'Unknown error'
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function enqueueEmailJob(args: {
  dedupeKey: string
  template: string
  to: string
  subject: string
  payload: Record<string, unknown>
}): Promise<void> {
  const result = await supabaseRest(
    'email_jobs?on_conflict=dedupe_key',
    'POST',
    {
      dedupe_key: args.dedupeKey,
      template: args.template,
      recipient_email: args.to,
      subject: args.subject,
      payload: args.payload,
      status: 'pending',
      updated_at: new Date().toISOString(),
    },
    { prefer: 'resolution=merge-duplicates' },
  )

  if (result.error) {
    console.error('enqueueEmailJob failed', result.error)
  }
}

export async function processEmailQueue(limit = 20): Promise<void> {
  const jobsResult = await supabaseRest<any[]>(
    `email_jobs?status=eq.pending&next_attempt_at=lte.${encodeURIComponent(new Date().toISOString())}&order=created_at.asc&limit=${limit}`,
    'GET',
  )

  if (jobsResult.error || !jobsResult.data?.length) {
    if (jobsResult.error) {
      console.error('processEmailQueue fetch failed', jobsResult.error)
    }
    return
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || EMAIL_FROM_FALLBACK

  for (const job of jobsResult.data) {
    try {
      if (!resendKey) {
        throw new Error('RESEND_API_KEY is not configured')
      }

      const html = `<p>${job.template}</p><pre>${JSON.stringify(job.payload ?? {}, null, 2)}</pre>`
      const sendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [job.recipient_email],
          subject: job.subject,
          html,
        }),
      })

      if (!sendRes.ok) {
        const body = await sendRes.text()
        throw new Error(`Email provider error: ${body}`)
      }

      await supabaseRest(`email_jobs?id=eq.${job.id}`, 'PATCH', {
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } catch (error) {
      const attempts = (job.attempts ?? 0) + 1
      const maxAttempts = job.max_attempts ?? 5
      const nextDelayMs = Math.min(2 ** attempts * 1000, 10 * 60 * 1000)
      const nextAttemptAt = new Date(Date.now() + nextDelayMs).toISOString()

      await supabaseRest(`email_jobs?id=eq.${job.id}`, 'PATCH', {
        attempts,
        status: attempts >= maxAttempts ? 'failed' : 'pending',
        last_error: parseError(error),
        next_attempt_at: nextAttemptAt,
        updated_at: new Date().toISOString(),
      })

      console.error('Email send failed', {
        jobId: job.id,
        attempts,
        error: parseError(error),
      })
    }
  }
}

async function markWebhookEventProcessed(args: {
  provider: PaymentProvider
  eventId: string
  orderId: string
  payload?: Record<string, unknown>
}): Promise<boolean> {
  const insertResult = await supabaseRest<any[]>(
    'payment_webhook_events',
    'POST',
    {
      provider: args.provider,
      event_id: args.eventId,
      order_id: args.orderId,
      payload: args.payload ?? {},
    },
    { prefer: 'return=representation' },
  )

  if (insertResult.error) {
    const errorRaw = JSON.stringify(insertResult.error)
    if (errorRaw.includes('duplicate key value') || errorRaw.includes('23505')) {
      return false
    }
    console.error('Failed to write payment_webhook_events', insertResult.error)
    return false
  }

  return Array.isArray(insertResult.data) && insertResult.data.length > 0
}

async function upsertPaymentTransaction(input: MarkOrderPaidInput): Promise<void> {
  const payload: Record<string, unknown> = {
    order_id: input.orderId,
    user_id: input.userId,
    payment_provider: input.provider,
    amount: input.amount,
    currency: input.currency,
    status: 'succeeded',
    metadata: input.metadata ?? {},
    updated_at: new Date().toISOString(),
    ...input.refs,
  }

  let endpoint = 'payment_transactions'
  if (input.provider === 'stripe') endpoint = 'payment_transactions?on_conflict=stripe_payment_intent_id'
  if (input.provider === 'paypal') endpoint = 'payment_transactions?on_conflict=paypal_order_id'
  if (input.provider === 'mollie') endpoint = 'payment_transactions?on_conflict=mollie_payment_id'

  const result = await supabaseRest(endpoint, 'POST', payload, {
    prefer: 'resolution=merge-duplicates',
  })

  if (result.error) {
    console.error('upsertPaymentTransaction failed', result.error)
  }
}

export async function fetchOrder(orderId: string): Promise<OrderRow | null> {
  const orderResult = await supabaseRest<OrderRow[]>(
    `orders?id=eq.${orderId}&select=*`,
    'GET',
  )

  if (orderResult.error) {
    console.error('fetchOrder failed', orderResult.error)
    return null
  }

  return orderResult.data?.[0] ?? null
}

export async function markOrderPaidIdempotent(input: MarkOrderPaidInput): Promise<{
  order: OrderRow | null
  wasAlreadyProcessed: boolean
}> {
  const firstTime = await markWebhookEventProcessed({
    provider: input.provider,
    eventId: input.eventId,
    orderId: input.orderId,
    payload: input.metadata ?? {},
  })

  if (!firstTime) {
    return {
      order: await fetchOrder(input.orderId),
      wasAlreadyProcessed: true,
    }
  }

  await upsertPaymentTransaction(input)

  const patchResult = await supabaseRest<OrderRow[]>(
    `orders?id=eq.${input.orderId}&select=*`,
    'PATCH',
    {
      status: 'paid',
      payment_status: 'paid',
      payment_method: input.provider,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...input.refs,
    },
    { prefer: 'return=representation' },
  )

  if (patchResult.error) {
    console.error('markOrderPaidIdempotent patch failed', patchResult.error)
  }

  return {
    order: patchResult.data?.[0] ?? (await fetchOrder(input.orderId)),
    wasAlreadyProcessed: false,
  }
}

async function createPrintifyOrder(args: {
  orderId: string
  lineItems: unknown[]
  shippingAddress: Record<string, unknown>
  metadata?: Record<string, unknown>
}): Promise<{ ok: boolean; orderId?: string; error?: string }> {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/create-printify-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: Deno.env.get('SUPABASE_ANON_KEY') || '',
        Authorization: `Bearer ${validateEnvVars.supabaseServiceKey()}`,
      },
      body: JSON.stringify({
        line_items: args.lineItems,
        shipping_address: args.shippingAddress,
        metadata: {
          ...(args.metadata ?? {}),
          order_id: args.orderId,
        },
      }),
    })

    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      return { ok: false, error: JSON.stringify(body) }
    }

    const printifyOrderId = body?.order?.id || body?.id
    return { ok: true, orderId: printifyOrderId }
  } catch (error) {
    return { ok: false, error: parseError(error) }
  }
}

export async function processPaidOrder(input: ProcessPaidOrderInput): Promise<void> {
  const { order, wasAlreadyProcessed } = await markOrderPaidIdempotent(input)

  if (!order || wasAlreadyProcessed) {
    return
  }

  if (order.printify_order_id || order.status === 'confirmed') {
    return
  }

  const printifyResult = await createPrintifyOrder({
    orderId: input.orderId,
    lineItems: input.lineItems,
    shippingAddress: input.shippingAddress,
    metadata: input.metadata,
  })

  if (printifyResult.ok) {
    await supabaseRest(`orders?id=eq.${input.orderId}`, 'PATCH', {
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      printify_order_id: printifyResult.orderId ?? order.printify_order_id,
      updated_at: new Date().toISOString(),
    })

    await enqueueEmailJob({
      dedupeKey: `invoice:${input.orderId}`,
      template: 'invoice',
      to: order.customer_email,
      subject: `Invoice for order ${order.order_number}`,
      payload: {
        orderId: input.orderId,
        orderNumber: order.order_number,
        amount: order.total_amount,
        currency: order.currency,
      },
    })

    await processEmailQueue(5)
    return
  }

  await supabaseRest(`orders?id=eq.${input.orderId}`, 'PATCH', {
    status: 'paid',
    manual_review_required: true,
    internal_notes: `Printify creation failed: ${printifyResult.error}`,
    updated_at: new Date().toISOString(),
  })

  const ownerEmail = Deno.env.get('OWNER_EMAIL')
  if (ownerEmail) {
    await enqueueEmailJob({
      dedupeKey: `owner-alert:printify:${input.orderId}`,
      template: 'owner_printify_failure',
      to: ownerEmail,
      subject: `Manual action required: order ${order.order_number}`,
      payload: {
        orderId: input.orderId,
        orderNumber: order.order_number,
        error: printifyResult.error,
      },
    })
    await processEmailQueue(5)
  }
}

async function cancelPrintifyOrder(printifyOrderId: string): Promise<void> {
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/cancel-printify-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: Deno.env.get('SUPABASE_ANON_KEY') || '',
      Authorization: `Bearer ${validateEnvVars.supabaseServiceKey()}`,
    },
    body: JSON.stringify({ order_id: printifyOrderId }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Printify cancellation failed: ${body}`)
  }
}

async function retryWithBackoff<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let currentError: unknown
  for (let index = 0; index < attempts; index += 1) {
    try {
      return await fn()
    } catch (error) {
      currentError = error
      if (index < attempts - 1) {
        const delay = Math.min(2 ** index * 500, 4000)
        await sleep(delay)
      }
    }
  }
  throw currentError
}

async function refundStripePaymentIntent(paymentIntentId: string): Promise<void> {
  const secretKey = validateEnvVars.stripeSecretKey()

  const body = new URLSearchParams({ payment_intent: paymentIntentId })

  const response = await fetch('https://api.stripe.com/v1/refunds', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(`Stripe refund failed: ${data?.error?.message ?? response.statusText}`)
  }
}

async function refundPayPalCapture(captureId: string): Promise<void> {
  await paypalRequest(`/v2/payments/captures/${captureId}/refund`, 'POST', {})
}

async function refundMolliePayment(paymentId: string): Promise<void> {
  await mollieRequest(`/payments/${paymentId}/refunds`, 'POST', {})
}

async function performFullRefund(order: OrderRow): Promise<void> {
  const txResult = await supabaseRest<any[]>(
    `payment_transactions?order_id=eq.${order.id}&select=*`,
    'GET',
  )

  const tx = txResult.data?.[0]

  if (order.payment_method === 'stripe' && order.stripe_payment_intent_id) {
    await refundStripePaymentIntent(order.stripe_payment_intent_id)
    return
  }

  if (order.payment_method === 'paypal' && tx?.paypal_capture_id) {
    await refundPayPalCapture(tx.paypal_capture_id)
    return
  }

  if (order.payment_method === 'mollie' && tx?.mollie_payment_id) {
    await refundMolliePayment(tx.mollie_payment_id)
    return
  }

  throw new Error(`Unsupported refund provider or missing reference for order ${order.id}`)
}

export async function cancelOrderLifecycle(input: CancelOrderInput): Promise<{ status: 'cancelled' | 'refund_failed' }> {
  const order = await fetchOrder(input.orderId)
  if (!order) {
    throw new Error('Order not found')
  }

  if (order.status === 'in_production' || order.status === 'shipped' || order.status === 'delivered') {
    throw new Error('Order cannot be cancelled after production starts')
  }

  if (order.status !== 'waiting_payment' && order.status !== 'confirmed') {
    throw new Error(`Order status ${order.status} is not cancellable`)
  }

  // Race-condition guard for confirmed orders.
  if (order.status === 'confirmed') {
    const lockResult = await supabaseRest<OrderRow[]>(
      `orders?id=eq.${input.orderId}&status=eq.confirmed&select=*`,
      'PATCH',
      { updated_at: new Date().toISOString() },
      { prefer: 'return=representation' },
    )

    if (!lockResult.data?.length) {
      throw new Error('Cancellation was rejected because order state changed')
    }
  }

  if (order.printify_order_id) {
    try {
      await cancelPrintifyOrder(order.printify_order_id)
    } catch (error) {
      await supabaseRest(`orders?id=eq.${input.orderId}`, 'PATCH', {
        manual_review_required: true,
        internal_notes: `Printify cancellation failed: ${parseError(error)}`,
        updated_at: new Date().toISOString(),
      })
    }
  }

  if (order.status === 'confirmed') {
    try {
      await retryWithBackoff(async () => {
        await performFullRefund(order)
      }, 3)
    } catch (error) {
      await supabaseRest(`orders?id=eq.${input.orderId}`, 'PATCH', {
        refund_failed: true,
        refund_attempts: (order as any).refund_attempts ? (order as any).refund_attempts + 1 : 1,
        last_refund_error: parseError(error),
        manual_review_required: true,
        updated_at: new Date().toISOString(),
      })

      const ownerEmail = Deno.env.get('OWNER_EMAIL')
      if (ownerEmail) {
        await enqueueEmailJob({
          dedupeKey: `owner-alert:refund-failed:${input.orderId}`,
          template: 'owner_refund_failed',
          to: ownerEmail,
          subject: `Refund failed for order ${order.order_number}`,
          payload: {
            orderId: order.id,
            orderNumber: order.order_number,
            paymentMethod: order.payment_method,
            error: parseError(error),
          },
        })
      }

      await processEmailQueue(5)
      return { status: 'refund_failed' }
    }
  }

  await supabaseRest(`orders?id=eq.${input.orderId}`, 'PATCH', {
    status: 'cancelled',
    cancellation_reason: 'user_cancelled',
    cancelled_at: new Date().toISOString(),
    payment_status: order.status === 'confirmed' ? 'refunded' : order.payment_status,
    updated_at: new Date().toISOString(),
  })

  await enqueueEmailJob({
    dedupeKey: `cancel:${input.orderId}:${order.status}`,
    template: order.status === 'confirmed' ? 'cancellation_refund' : 'cancellation',
    to: order.customer_email,
    subject:
      order.status === 'confirmed'
        ? `Order ${order.order_number} cancelled and refunded`
        : `Order ${order.order_number} cancelled`,
    payload: {
      orderId: order.id,
      orderNumber: order.order_number,
      refundIncluded: order.status === 'confirmed',
    },
  })

  await processEmailQueue(5)

  return { status: 'cancelled' }
}

export async function revalidateOrderForPayment(
  orderId: string,
  requestingUserId?: string,
): Promise<{ ok: boolean; reason?: string }> {
  const order = await fetchOrder(orderId)
  if (!order) {
    return { ok: false, reason: 'Order not found' }
  }

  if (
    requestingUserId &&
    requestingUserId !== 'service-role' &&
    order.user_id !== requestingUserId
  ) {
    return { ok: false, reason: 'Forbidden' }
  }

  if (order.status !== 'waiting_payment') {
    return { ok: false, reason: 'Order is not awaiting payment' }
  }

  const now = Date.now()
  const createdAt = new Date((order as any).created_at ?? 0).getTime()
  if (Number.isFinite(createdAt) && now - createdAt > 24 * 60 * 60 * 1000) {
    return { ok: false, reason: 'Order expired' }
  }

  return { ok: true }
}
