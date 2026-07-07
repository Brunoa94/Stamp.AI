import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts"
import { validateEnvVars } from "../_shared/validators.ts"
import { requireUser } from "../_shared/authGuard.ts"
import { supabaseRest } from "../_shared/supabase.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/**
 * Cancel a Printify order
 *
 * IMPORTANT: Can only cancel orders with status 'on-hold' or 'payment-not-received'
 * Orders already in production cannot be canceled
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const auth = await requireUser(req.headers.get('authorization'))

    const { order_id } = await req.json()

    if (!order_id) {
      throw ErrorCodes.MISSING_REQUIRED_FIELDS("order_id is required")
    }

    // Ensure non-service callers can only cancel their own orders
    if (!auth.isServiceRole) {
      const { data: ownedOrders } = await supabaseRest<Array<{ id: string }>>(
        `orders?printify_order_id=eq.${encodeURIComponent(order_id)}&user_id=eq.${encodeURIComponent(auth.userId)}&select=id`,
        "GET"
      )

      if (!ownedOrders || ownedOrders.length === 0) {
        throw new FunctionError(403, "FORBIDDEN", "Order not found for this user")
      }
    }

    console.log('=== CANCEL PRINTIFY ORDER ===')
    console.log('Order ID:', order_id)

    // Validate Printify configuration
    const PRINTIFY_API_TOKEN = validateEnvVars.printifyToken()
    const PRINTIFY_SHOP_ID = validateEnvVars.printifyShopId()

    // Cancel the order in Printify
    const response = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/orders/${order_id}/cancel.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    console.log('Printify API response status:', response.status)
    console.log('Printify API response:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      // If order cannot be canceled (wrong status), return a specific error
      if (data.errors?.reason?.includes('status')) {
        console.warn('⚠️ Order cannot be canceled - likely already in production')
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Order cannot be canceled (already in production or shipped)',
            error: data.errors?.reason,
            order_id,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      console.error('Printify API error:', data)
      throw ErrorCodes.PRINTIFY_ORDER_API_ERROR(JSON.stringify(data))
    }

    console.log(`✅ Order ${order_id} canceled successfully`)

    return new Response(
      JSON.stringify({
        success: true,
        order: data,
        message: 'Order canceled successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error canceling Printify order:', error)
    return handleError(error, corsHeaders)
  }
})
