import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"
import { revalidateOrderForPayment } from '../_shared/order-lifecycle.ts'
import type { CreatePaymentIntentRequestI, PaymentIntentResponseI } from "../../types/index.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/**
 * Verify authentication - accepts both user JWT tokens and service role key
 * Returns user info if available, or service identifier if using service role
 */
async function verifyAuth(authHeader: string | null): Promise<{ userId: string; userEmail: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ErrorCodes.INVALID_TOKEN()
  }

  const token = authHeader.replace('Bearer ', '')
  const supabaseUrl = validateEnvVars.supabaseUrl()
  const supabaseAnonKey = validateEnvVars.supabaseAnonKey()
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  // Check if it's the service role key (server-to-server calls)
  if (serviceRoleKey && token === serviceRoleKey) {
    console.log('Authenticated with service role key')
    return {
      userId: 'service-role',
      userEmail: 'service@system.internal',
    }
  }

  // Otherwise, validate as user JWT token
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': supabaseAnonKey,
    },
  })

  if (!response.ok) {
    console.error('Auth verification failed:', response.status, response.statusText)
    throw ErrorCodes.INVALID_TOKEN()
  }

  const user = await response.json()

  if (!user || !user.id) {
    throw ErrorCodes.INVALID_TOKEN()
  }

  console.log('Authenticated user:', user.id)
  return {
    userId: user.id,
    userEmail: user.email || '',
  }
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
    // Verify authentication
    const authHeader = req.headers.get('authorization')
    const { userId, userEmail } = await verifyAuth(authHeader)

    console.log('Authenticated user:', userId)

    const {
      amount,
      currency = 'usd',
      line_items,
      shipping_address,
      metadata,
      payment_method, // Optional: for testing with pm_card_visa, etc.
      confirm = false // Optional: auto-confirm payment (for testing)
    } = await req.json()

    const candidateOrderId =
      metadata && typeof metadata.order_id === 'string' ? metadata.order_id : undefined

    if (candidateOrderId && validateRequest.isUuid(candidateOrderId)) {
      const revalidation = await revalidateOrderForPayment(candidateOrderId, userId)
      if (!revalidation.ok) {
        throw ErrorCodes.INVALID_REQUEST_BODY()
      }
    } else if (candidateOrderId) {
      console.warn('Skipping order revalidation because order_id is not a UUID:', candidateOrderId)
    }

    // Validate environment variables and request data
    const stripeSecretKey = validateEnvVars.stripeSecretKey()
    const validAmount = validateRequest.amount(amount)

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Build payment intent options
    const paymentIntentOptions: any = {
      amount: Math.round(validAmount * 100), // Convert to cents
      currency: currency,
      metadata: {
        ...metadata,
        user_id: userId,
        user_email: userEmail,
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

    const response: PaymentIntentResponseI = {
      success: true,
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id
    }

    return new Response(
      JSON.stringify(response),
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