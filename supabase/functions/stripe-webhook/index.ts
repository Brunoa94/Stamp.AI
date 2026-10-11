import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@16.12.0?target=deno'
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateRequest } from "../_shared/validators.ts"
import {
  assertStripeLivemode,
  createStripeClient,
  getStripeSecretKey,
  getStripeWebhookSecret,
  stripeModeFromUrl,
} from "../_shared/stripeConfig.ts"
import { supabaseRest } from "../_shared/supabase.ts"
import { corsHeadersFor } from '../_shared/cors.ts'
import { claimWebhookEvent, releaseWebhookEvent } from '../_shared/webhookEvents.ts'
import { settlePaidOrder } from '../_shared/paidOrderSettlement.ts'
import "../_shared/sentry.ts";

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
  const corsHeaders = corsHeadersFor(req, { extraAllowedHeaders: ['stripe-signature'] })
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // The endpoint registered in the Stripe TEST dashboard carries `?mode=test`
  // and is verified with the test signing secret; the live endpoint has no
  // parameter and uses the live secret. See _shared/stripeConfig.ts.
  const stripeMode = stripeModeFromUrl(req.url)
  console.log(`Request received (stripe mode: ${stripeMode})`)

  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  const cryptoProvider = Stripe.createSubtleCryptoProvider()

  try {
    // Validate webhook signature and environment variables
    const validSignature = validateRequest.webhookSignature(signature)
    const webhookSecret = getStripeWebhookSecret(stripeMode)
    const stripeSecretKey = getStripeSecretKey(stripeMode)
    const stripe = createStripeClient(stripeMode, '2023-10-16')

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

    // A test event must never be processed with a live key (or vice versa).
    assertStripeLivemode(stripeSecretKey, event.livemode)

    console.log('Webhook event type:', event.type)

    // Redelivered events are acknowledged without being processed twice.
    if (!(await claimWebhookEvent('stripe', event.id, event.type, event))) {
      console.log(`Stripe event ${event.id} already processed, skipping`)
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    try {
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
        // The order link is never taken from metadata the client could set.
        const userId = paymentIntent.metadata?.user_id

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
            p_metadata: paymentIntent.metadata || {},
            p_order_id: null
          }
        )

        if (upsertResult.error) {
          throw new Error('Failed to record the succeeded payment')
        }

        // The order is created here when the customer never came back to the
        // shop; the return page then only fulfils it.
        const settledOrderId = await settlePaidOrder('stripe', paymentIntent.id)
        console.log(settledOrderId ? `✅ Order ${settledOrderId} settled as paid` : '⚠️ No order could be settled for this payment')
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
          // Update the linked, still unpaid order of the same customer
          const txResult = await supabaseRest<Array<{ order_id: string | null; user_id: string | null }>>(
            `payment_transactions?stripe_payment_intent_id=eq.${paymentIntent.id}&select=order_id,user_id`,
            'GET'
          )
          const dbOrderId = txResult.data?.[0]?.order_id
          const ownerId = txResult.data?.[0]?.user_id

          if (dbOrderId && ownerId) {
            const orderResult = await supabaseRest(
              `orders?id=eq.${dbOrderId}&user_id=eq.${ownerId}&payment_status=neq.paid`,
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

    } catch (processingError) {
      // Let Stripe redeliver: the event must be processed, not just recorded.
      await releaseWebhookEvent('stripe', event.id)
      throw processingError
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