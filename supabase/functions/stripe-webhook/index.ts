import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@16.12.0?target=deno'
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"
import { supabaseRest } from "../_shared/supabase.ts"
import { tryGenerateInvoiceForOrder } from "../_shared/invoice.ts"
import { claimWebhookEvent } from "../_shared/webhookEvents.ts"
import { buildIdempotencyKey } from "../_shared/paymentReference.ts"
import {
  ensureOrderForPaidPayment,
  findOrderByIdempotencyKey,
  loadPaymentTransaction,
} from "../_shared/finalizePaidOrderDeps.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

/**
 * Stripe Payment Intent interface for webhook handling
 */
interface StripePaymentIntentI {
  id: string;
  customer: string | null;
  amount: number;
  amount_received: number;
  currency: string;
  livemode: boolean;
  payment_method_types?: string[];
  last_payment_error?: {
    message?: string;
  };
  metadata?: Record<string, string>;
}

// Server-side price per credit (in cents). Must match create-credit-payment.
const CREDIT_PRICE_CENTS = Number(Deno.env.get('CREDIT_PRICE_CENTS') || '10')

/**
 * Handle credit purchase - update user credits and create transaction record
 */
async function handleCreditPurchase(paymentIntent: StripePaymentIntentI) {
  const userId = paymentIntent.metadata?.user_id
  if (!userId || userId === 'service-role' || !Number.isSafeInteger(CREDIT_PRICE_CENTS) || CREDIT_PRICE_CENTS <= 0) {
    throw new Error('Invalid credit purchase identity or price')
  }
  // Claim the payment, increment the balance, and record payment accounting in
  // one transaction. Errors propagate so Stripe retries instead of losing credits.
  const result = await supabaseRest('rpc/grant_stripe_purchase_credits', 'POST', {
    p_payment_intent_id: paymentIntent.id,
    p_user_id: userId,
    p_amount_cents: paymentIntent.amount_received,
    p_credit_price_cents: CREDIT_PRICE_CENTS,
    p_currency: paymentIntent.currency,
    p_customer_id: paymentIntent.customer,
    p_payment_method_type: paymentIntent.payment_method_types?.[0] || 'card',
    p_metadata: paymentIntent.metadata || {},
  })
  if (result.error) throw new Error('Failed to grant purchase credits')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('Request received')
  
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  // Validate webhook signature and environment variables
  const validSignature = validateRequest.webhookSignature(signature)
  const stripeSecretKey = validateEnvVars.stripeSecretKey()

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })

  const cryptoProvider = Stripe.createSubtleCryptoProvider()

  try {
    const webhookSecret = validateEnvVars.stripeWebhookSecret()

    let event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        validSignature,
        webhookSecret,
        undefined,
        cryptoProvider
      )
    } catch (stripeError: any) {
      throw ErrorCodes.WEBHOOK_SIGNATURE_INVALID(stripeError.message)
    }

    console.log('Webhook event type:', event.type)

    // Atomic idempotency: record the event and skip duplicate deliveries in
    // one step (same pattern as paypal-webhook). Stripe retries events that
    // did not get a 2xx, so re-deliveries are expected.
    const claim = await claimWebhookEvent('stripe', event.id, event.type, event)
    if (claim.duplicate) {
      console.log(`✅ Stripe webhook ${event.id} already processed, skipping`)
      return new Response(
        JSON.stringify({ received: true, skipped: true, reason: 'already_processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      )
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        console.log('Handling payment_intent.succeeded')
        const paymentIntent = event.data.object

        // Check if this is a credit purchase
        const isCreditPurchase = paymentIntent.metadata?.type === 'credit_purchase'

        if (isCreditPurchase) {
          console.log('Processing credit purchase')
          await handleCreditPurchase(paymentIntent)
          break
        }

        // CRITICAL: Use atomic UPSERT to prevent race conditions
        // Handles case where webhook arrives before create-payment-intent.
        // Keep the structured metadata written at intent creation (line
        // items, address) — Stripe only echoes back string values.
        const userId = paymentIntent.metadata?.user_id
        const orderId = paymentIntent.metadata?.order_id
        const storedTransaction = await loadPaymentTransaction('stripe', paymentIntent.id).catch(() => null)

        const upsertResult = await supabaseRest(
          'rpc/upsert_stripe_payment_transaction',
          'POST',
          {
            p_stripe_payment_intent_id: paymentIntent.id,
            p_user_id: userId || null,
            p_stripe_customer_id: paymentIntent.customer,
            p_amount: paymentIntent.amount / 100,
            p_currency: paymentIntent.currency,
            p_status: 'succeeded',
            p_payment_method_type: paymentIntent.payment_method_types?.[0] || 'card',
            p_metadata: { ...(paymentIntent.metadata || {}), ...(storedTransaction?.metadata || {}) },
            p_order_id: orderId || null
          }
        )

        if (upsertResult.error) {
          console.error('❌ Upsert error:', upsertResult.error)
          break
        }

        console.log('✅ Payment transaction upserted atomically:', paymentIntent.id)

        // Resolve the order for this payment: metadata, the transaction link,
        // or the order minted by finalize-order (idempotency key). When none
        // exists yet, mint it now from the stored payment context — never
        // wait for the browser.
        // NOTE: Webhooks should ONLY update payment_status, NEVER order status
        // Order status is managed by the fulfillment service to prevent race conditions
        let dbOrderId: string | null | undefined = orderId || storedTransaction?.order_id
        if (!dbOrderId) {
          dbOrderId = (await findOrderByIdempotencyKey(buildIdempotencyKey('stripe', paymentIntent.id)).catch(() => null))?.id
        }
        if (!dbOrderId) {
          dbOrderId = await ensureOrderForPaidPayment({
            provider: 'stripe',
            paymentId: paymentIntent.id,
            providerMetadata: paymentIntent.metadata,
            charged: { amount: paymentIntent.amount_received / 100, currency: paymentIntent.currency },
          })
        }

        if (dbOrderId) {
          // Update payment_transactions with order_id (in case it wasn't in metadata)
          const linkResult = await supabaseRest(
            `payment_transactions?stripe_payment_intent_id=eq.${paymentIntent.id}`,
            'PATCH',
            {
              order_id: dbOrderId,
              updated_at: new Date().toISOString(),
            }
          )

          if (linkResult.error) {
            console.error('Failed to link payment transaction to order:', linkResult.error)
          } else {
            console.log(`✅ Payment transaction linked to order: ${dbOrderId}`)
          }

          const orderResult = await supabaseRest(
            `orders?id=eq.${dbOrderId}`,
            'PATCH',
            {
              payment_status: 'paid',
              payment_method: 'stripe',
              updated_at: new Date().toISOString(),
            }
          )

          if (orderResult.error) {
            console.error('Failed to update order payment_status:', orderResult.error)
          } else {
            console.log(`✅ Order ${dbOrderId} payment_status updated to: paid`)

            // Issue the invoice now that the order is paid (idempotent, non-blocking)
            await tryGenerateInvoiceForOrder(dbOrderId)
          }
        } else {
          console.warn(`⚠️ Payment ${paymentIntent.id} succeeded but no order could be created; left in payment_recovery`)
        }

        // Check if this is a test payment
        const isTestMode = !paymentIntent.livemode
        console.log('Payment mode - Test:', isTestMode)
        break
      }

      case 'payment_intent.payment_failed': {
        console.log('Handling payment_intent.payment_failed')
        const paymentIntent = event.data.object

        const result = await supabaseRest(
          'payment_transactions',
          'POST',
          {
            stripe_payment_intent_id: paymentIntent.id,
            stripe_customer_id: paymentIntent.customer,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: 'failed',
            payment_method_type: paymentIntent.payment_method_types?.[0],
            error_message: paymentIntent.last_payment_error?.message,
            metadata: paymentIntent.metadata,
            updated_at: new Date().toISOString()
          },
          { prefer: 'resolution=merge-duplicates' }
        )

        console.log('Upsert result:', result)
        if (result.error) {
          console.error('Upsert error:', result.error)
        } else {
          // Update order payment_status to "failed" if we have an order_id
          let dbOrderId = paymentIntent.metadata?.order_id

          // If orderId not in metadata, try to get it from payment_transactions.order_id column
          if (!dbOrderId) {
            const txResult = await supabaseRest<Array<{ order_id: string | null }>>(
              `payment_transactions?stripe_payment_intent_id=eq.${paymentIntent.id}&select=order_id`,
              'GET'
            )
            dbOrderId = txResult.data?.[0]?.order_id
            if (dbOrderId) {
              console.log(`✅ Found order_id in payment_transactions: ${dbOrderId}`)
            }
          }

          if (dbOrderId) {
            const orderResult = await supabaseRest(
              `orders?id=eq.${dbOrderId}`,
              'PATCH',
              {
                payment_status: 'failed',
                updated_at: new Date().toISOString(),
              }
            )

            if (orderResult.error) {
              console.error('Failed to update order payment_status:', orderResult.error)
            } else {
              console.log(`Order ${dbOrderId} payment_status updated to: failed`)
            }
          }
        }
        break
      }

      case 'charge.succeeded': {
        console.log('Handling charge.succeeded')
        const charge = event.data.object

        const result = await supabaseRest(
          `payment_transactions?stripe_payment_intent_id=eq.${charge.payment_intent}`,
          'PATCH',
          {
            stripe_charge_id: charge.id,
            payment_method_details: charge.payment_method_details,
            updated_at: new Date().toISOString()
          }
        )

        console.log('Update result:', result)
        if (result.error) console.error('Update error:', result.error)
        break
      }

      case 'checkout.session.completed': {
        console.log('Handling checkout.session.completed')
        const session = event.data.object

        const result = await supabaseRest(
          'payment_transactions',
          'POST',
          {
            user_id: session.metadata?.user_id,
            order_id: session.metadata?.order_id,
            stripe_payment_intent_id: session.payment_intent,
            stripe_customer_id: session.customer,
            amount: session.amount_total / 100,
            currency: session.currency,
            status: 'processing',
            metadata: session.metadata,
          }
        )

        console.log('Insert result:', result)
        if (result.error) console.error('Insert error:', result.error)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    console.log('Returning success response')
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return handleError(err, corsHeaders)
  }
})