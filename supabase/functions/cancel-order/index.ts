import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { handleError, ErrorCodes } from '../_shared/errors.ts'
import { verifyAuth } from '../_shared/validators.ts'
import { cancelOrderLifecycle } from '../_shared/order-lifecycle.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('authorization')
    const { userId } = await verifyAuth(authHeader)

    const body = await req.json()
    const orderId = body?.orderId as string | undefined

    if (!orderId) {
      throw ErrorCodes.MISSING_REQUIRED_FIELDS('orderId is required')
    }

    const result = await cancelOrderLifecycle({
      orderId,
      requestedBy: userId,
    })

    const statusCode = result.status === 'refund_failed' ? 409 : 200

    return new Response(
      JSON.stringify({
        success: result.status === 'cancelled',
        status: result.status,
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return handleError(error, corsHeaders)
  }
})
