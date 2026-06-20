import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@16.12.0?target=deno'
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"
import { supabaseRest } from "../_shared/supabase.ts"

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
  currency: string;
  livemode: boolean;
  payment_method_types?: string[];
  last_payment_error?: {
    message?: string;
  };
  metadata?: Record<string, string>;
}

/**
 * Handle credit purchase - update user credits and create transaction record
 */
async function handleCreditPurchase(paymentIntent: StripePaymentIntentI) {
  const userId = paymentIntent.metadata?.user_id
  const creditsToAdd = parseInt(paymentIntent.metadata?.credits || '0', 10)
  const amountPaid = paymentIntent.amount / 100

  if (!userId || userId === 'service-role') {
    console.error('Invalid user_id for credit purchase:', userId)
    return
  }

  if (creditsToAdd <= 0) {
    console.error('Invalid credits amount:', creditsToAdd)
    return
  }

  console.log(`Adding ${creditsToAdd} credits to user ${userId}`)

  // Get current user credits
  const currentCreditsResult = await supabaseRest(
    `user_credits?user_id=eq.${userId}&select=credits`,
    'GET'
  )

  let currentCredits = 0
  let userExists = false

  if (currentCreditsResult.data && currentCreditsResult.data.length > 0) {
    currentCredits = currentCreditsResult.data[0].credits || 0
    userExists = true
  }

  const newBalance = currentCredits + creditsToAdd

  // Update or insert user credits
  if (userExists) {
    const updateResult = await supabaseRest(
      `user_credits?user_id=eq.${userId}`,
      'PATCH',
      {
        credits: newBalance,
        updated_at: new Date().toISOString()
      }
    )

    if (updateResult.error) {
      console.error('Failed to update user credits:', updateResult.error)
      return
    }
  } else {
    const insertResult = await supabaseRest(
      'user_credits',
      'POST',
      {
        user_id: userId,
        credits: newBalance,
        updated_at: new Date().toISOString()
      }
    )

    if (insertResult.error) {
      console.error('Failed to insert user credits:', insertResult.error)
      return
    }
  }

  console.log(`Updated user ${userId} credits: ${currentCredits} -> ${newBalance}`)

  // Create credit transaction record
  const transactionResult = await supabaseRest(
    'credit_transactions',
    'POST',
    {
      user_id: userId,
      amount: creditsToAdd,
      balance_after: newBalance,
      transaction_type: 'purchase',
      description: `Purchased ${creditsToAdd} credits for $${amountPaid.toFixed(2)}`,
      reference_id: paymentIntent.id,
      created_at: new Date().toISOString()
    }
  )

  if (transactionResult.error) {
    console.error('Failed to create credit transaction:', transactionResult.error)
  } else {
    console.log('Credit transaction recorded:', transactionResult.data)
  }

  // Also record in payment_transactions for consistency
  await supabaseRest(
    'payment_transactions',
    'POST',
    {
      user_id: userId,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: paymentIntent.customer,
      amount: amountPaid,
      currency: paymentIntent.currency,
      status: 'succeeded',
      payment_method_type: paymentIntent.payment_method_types?.[0],
      metadata: {
        ...paymentIntent.metadata,
        type: 'credit_purchase'
      },
      updated_at: new Date().toISOString()
    },
    { prefer: 'resolution=merge-duplicates' }
  )

  console.log('Credit purchase completed successfully')
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

        // Update payment_transactions record (created by create-payment-intent)
        // Extract user_id from metadata
        const userId = paymentIntent.metadata?.user_id

        // Try to update existing record first
        const updateResult = await supabaseRest(
          `payment_transactions?stripe_payment_intent_id=eq.${paymentIntent.id}`,
          'PATCH',
          {
            user_id: userId || null,
            stripe_customer_id: paymentIntent.customer,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: 'succeeded',
            payment_method_type: paymentIntent.payment_method_types?.[0],
            metadata: paymentIntent.metadata,
            updated_at: new Date().toISOString()
          }
        )

        // If no record was updated (race condition - webhook arrived before create-payment-intent), create it
        if (!updateResult.data || (Array.isArray(updateResult.data) && updateResult.data.length === 0)) {
          console.log('No existing record found, creating new one (race condition)')
          const insertResult = await supabaseRest(
            'payment_transactions',
            'POST',
            {
              user_id: userId || null,
              payment_provider: 'stripe',
              stripe_payment_intent_id: paymentIntent.id,
              stripe_customer_id: paymentIntent.customer,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              status: 'succeeded',
              payment_method_type: paymentIntent.payment_method_types?.[0],
              metadata: paymentIntent.metadata,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          )

          if (insertResult.error) {
            console.error('Insert error:', insertResult.error)
          }
        } else {
          console.log('✅ Payment transaction updated:', paymentIntent.id)
        }

        const result = updateResult

        console.log('Upsert result:', result)
        if (result.error) {
          console.error('Upsert error:', result.error)
          break
        }

        // Update order payment_status to "paid"
        // NOTE: Webhooks should ONLY update payment_status, NEVER order status
        // Order status is managed by the fulfillment service to prevent race conditions
        let dbOrderId = paymentIntent.metadata?.order_id

        // If orderId not in metadata, try to get it from payment_transactions.order_id column
        // (set by client-side after order creation)
        if (!dbOrderId) {
          const txResult = await supabaseRest(
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
              payment_status: 'paid',
              payment_method: 'stripe',
              updated_at: new Date().toISOString(),
            }
          )

          if (orderResult.error) {
            console.error('Failed to update order payment_status:', orderResult.error)
          } else {
            console.log(`✅ Order ${dbOrderId} payment_status updated to: paid`)
          }
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
            const txResult = await supabaseRest(
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