import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { ErrorCodes, handleError } from "../_shared/errors.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    const {
      amount,
      currency = 'usd',
      line_items,
      shipping_address,
      metadata,
      payment_method, // Optional: for testing with pm_card_visa, etc.
      confirm = false // Optional: auto-confirm payment (for testing)
    } = await req.json()

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw ErrorCodes.STRIPE_SECRET_KEY_MISSING()
    }

    if (!amount) {
      throw ErrorCodes.AMOUNT_REQUIRED()
    }

    if (typeof amount !== 'number' || amount <= 0) {
      throw ErrorCodes.INVALID_AMOUNT()
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Build payment intent options
    const paymentIntentOptions: any = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: {
        ...metadata,
        line_items: JSON.stringify(line_items),
        shipping_address: JSON.stringify(shipping_address),
      },
    }

    // If a test payment method is provided (e.g., pm_card_visa), attach it
    if (payment_method) {
      paymentIntentOptions.payment_method = payment_method
      paymentIntentOptions.payment_method_types = ['card']
      if (confirm) {
        paymentIntentOptions.confirm = true
      }
    } else {
      // For regular checkout flow with card element
      paymentIntentOptions.automatic_payment_methods = {
        enabled: true,
      }
    }

    // Create payment intent
    let paymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions)
    } catch (stripeError: any) {
      throw ErrorCodes.STRIPE_API_ERROR(stripeError.message || JSON.stringify(stripeError))
    }

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return handleError(error, corsHeaders)
  }
})