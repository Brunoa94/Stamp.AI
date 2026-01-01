import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('Request received')
  
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })

  const cryptoProvider = Stripe.createSubtleCryptoProvider()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )
  
  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret!,
      undefined,
      cryptoProvider
    )

    console.log('Webhook event type:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        console.log('Handling payment_intent.succeeded')
        const paymentIntent = event.data.object
        
        // Save payment to database
        const result = await supabase
          .from('payment_transactions')
          .upsert({
            stripe_payment_intent_id: paymentIntent.id,
            stripe_customer_id: paymentIntent.customer,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: 'succeeded',
            payment_method_type: paymentIntent.payment_method_types?.[0],
            metadata: paymentIntent.metadata,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'stripe_payment_intent_id'
          })
        
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
        
        const printifyResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/create-printify-order`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              is_test: isTestMode, // Pass test mode to Printify
              line_items: paymentIntent.metadata?.line_items 
                ? JSON.parse(paymentIntent.metadata.line_items)
                : [],
              shipping_address: paymentIntent.metadata?.shipping_address
                ? JSON.parse(paymentIntent.metadata.shipping_address)
                : {},
              metadata: {
                order_id: paymentIntent.metadata?.order_id,
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
        
        const result = await supabase
          .from('payment_transactions')
          .upsert({
            stripe_payment_intent_id: paymentIntent.id,
            stripe_customer_id: paymentIntent.customer,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: 'failed',
            payment_method_type: paymentIntent.payment_method_types?.[0],
            error_message: paymentIntent.last_payment_error?.message,
            metadata: paymentIntent.metadata,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'stripe_payment_intent_id'
          })
        
        console.log('Upsert result:', result)
        if (result.error) console.error('Upsert error:', result.error)
        break
      }

      case 'charge.succeeded': {
        console.log('Handling charge.succeeded')
        const charge = event.data.object
        
        const result = await supabase
          .from('payment_transactions')
          .update({
            stripe_charge_id: charge.id,
            payment_method_details: charge.payment_method_details,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', charge.payment_intent)
        
        console.log('Update result:', result)
        if (result.error) console.error('Update error:', result.error)
        break
      }

      case 'checkout.session.completed': {
        console.log('Handling checkout.session.completed')
        const session = event.data.object
        
        const result = await supabase
          .from('payment_transactions')
          .insert({
            user_id: session.metadata?.user_id,
            order_id: session.metadata?.order_id,
            stripe_payment_intent_id: session.payment_intent,
            stripe_customer_id: session.customer,
            amount: session.amount_total / 100,
            currency: session.currency,
            status: 'processing',
            metadata: session.metadata,
          })
        
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
    console.error('Webhook error:', err.message)
    console.error('Full error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})