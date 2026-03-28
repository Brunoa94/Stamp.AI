import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { ErrorCodes, handleError, FunctionError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Credit-specific error codes
const CreditErrors = {
  CREDITS_REQUIRED: () => new FunctionError(400, 'CREDITS_REQUIRED', 'credits amount is required'),
  INVALID_CREDITS: () => new FunctionError(400, 'INVALID_CREDITS', 'credits must be at least 10'),
}

interface CreateCreditPaymentRequest {
  amount: number
  credits: number
  currency?: string
}

interface CreditPaymentResponse {
  success: boolean
  clientSecret: string
  paymentIntentId: string
}

/**
 * Verify authentication - accepts both user JWT tokens and service role key
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

/**
 * Validate credits amount
 */
function validateCredits(credits?: number): number {
  if (!credits) throw CreditErrors.CREDITS_REQUIRED()
  if (typeof credits !== 'number' || credits < 10) {
    throw CreditErrors.INVALID_CREDITS()
  }
  return credits
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

    console.log('Authenticated user for credit purchase:', userId)

    const {
      amount,
      credits,
      currency = 'usd',
    }: CreateCreditPaymentRequest = await req.json()

    // Validate environment variables and request data
    const stripeSecretKey = validateEnvVars.stripeSecretKey()
    const validAmount = validateRequest.amount(amount)
    const validCredits = validateCredits(credits)

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Build payment intent options for credit purchase
    const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(validAmount * 100), // Convert to cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: 'credit_purchase',
        user_id: userId,
        user_email: userEmail,
        credits: validCredits.toString(),
        amount_usd: validAmount.toString(),
      },
    }

    // Create payment intent
    let paymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions)
      console.log('Created payment intent for credit purchase:', paymentIntent.id)
    } catch (stripeError: unknown) {
      const errorMessage = stripeError instanceof Error ? stripeError.message : JSON.stringify(stripeError)
      throw ErrorCodes.STRIPE_API_ERROR(errorMessage)
    }

    const response: CreditPaymentResponse = {
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
    console.error('Error creating credit payment intent:', error)
    return handleError(error, corsHeaders)
  }
})
