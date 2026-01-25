import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

/**
 * Helper to call Supabase REST API directly without the client library
 */
async function supabaseRest(
  endpoint: string,
  method: string,
  body?: any,
  options?: { prefer?: string }
) {
  const supabaseUrl = validateEnvVars.supabaseUrl()
  const serviceKey = validateEnvVars.supabaseServiceKey()

  const headers: Record<string, string> = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  }

  if (options?.prefer) {
    headers['Prefer'] = options.prefer
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Handle empty responses (204 No Content, or empty body)
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  return {
    data,
    error: response.ok ? null : data,
    status: response.status
  }
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
        
        // Save payment to database using REST API
        const result = await supabaseRest(
          'payment_transactions',
          'POST',
          {
            stripe_payment_intent_id: paymentIntent.id,
            stripe_customer_id: paymentIntent.customer,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: 'succeeded',
            payment_method_type: paymentIntent.payment_method_types?.[0],
            metadata: paymentIntent.metadata,
            updated_at: new Date().toISOString()
          },
          { prefer: 'resolution=merge-duplicates' }
        )

        console.log('Upsert result:', result)
        if (result.error) {
          console.error('Upsert error:', result.error)
          break
        }

        // Check if this is a test payment
        const isTestMode = !paymentIntent.livemode
        console.log('Payment mode - Test:', isTestMode)

        // Call Printify to create order (only if payment saved successfully)
        console.log('Calling Printify order creation')

        // Parse line items and shipping from metadata
        const lineItems = paymentIntent.metadata?.line_items 
          ? JSON.parse(paymentIntent.metadata.line_items)
          : []
        const shippingAddress = paymentIntent.metadata?.shipping_address
          ? JSON.parse(paymentIntent.metadata.shipping_address)
          : {}

        // If no line items (e.g., from stripe trigger test), use sample order
        const useSampleOrder = lineItems.length === 0
        
        const printifyResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/create-printify-order`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              is_test: true,
              auto_cancel: true, // Automatically cancel test orders to avoid accumulation
              use_sample_order: useSampleOrder, // Create sample order when testing
              line_items: lineItems,
              shipping_address: shippingAddress,
              metadata: {
                order_id: paymentIntent.metadata?.order_id || `stripe-test-${Date.now()}`,
                payment_intent_id: paymentIntent.id,
              },
            }),
          }
        )

        const printifyResult = await printifyResponse.json()
        console.log('Printify order result:', printifyResult)

        if (!printifyResponse.ok) {
          console.error('Failed to create Printify order:', printifyResult)
        }

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
        if (result.error) console.error('Upsert error:', result.error)
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