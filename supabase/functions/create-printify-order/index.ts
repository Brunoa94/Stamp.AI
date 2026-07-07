import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars } from "../_shared/validators.ts"
import { validateAndEnforceTestMode } from "../_shared/testModeSafeguard.ts"
import { validatePaymentAmount } from "../_shared/amountValidator.ts"
import { supabaseRest } from "../_shared/supabase.ts"

// Environment variables will be validated when needed

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

// Test data for when stripe trigger sends empty data
const TEST_SHIPPING_ADDRESS = {
  first_name: 'Test',
  last_name: 'Order',
  email: 'test@example.com',
  phone: '+1234567890',
  country: 'US',
  region: 'CA',
  address1: '123 Test Street',
  address2: '',
  city: 'San Francisco',
  zip: '94105',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    // Verify authentication (accepts user JWT or service role key)
    const authHeader = req.headers.get('authorization')
    const { userId, userEmail } = await verifyAuth(authHeader)

    console.log('Authenticated as:', userId)

    const requestBody = await req.json()

    const {
      line_items,
      shipping_method,
      shipping_address,
      address_to,
      is_test = true, // Default to test mode for safety; client must explicitly set false for production
      metadata,
      use_sample_order = false, // Flag to create a sample order for testing
      auto_cancel = false, // Flag to automatically cancel order after creation (for testing)
      payment_amount, // For amount validation
      payment_currency, // For amount validation
      subtotal, // For amount validation
      shipping_cost, // For amount validation
      discount, // For amount validation
    } = requestBody

    // ✅ SECURITY: a normal end user may only fulfill THEIR OWN order. Without
    // this, any authenticated user could pass another user's order_id and mark
    // it paid/confirmed. Service-role callers (server-to-server, recovery) are
    // trusted to act on any order.
    const requestedOrderId = metadata?.order_id
    if (userId !== 'service-role' && requestedOrderId) {
      const ownership = await supabaseRest<Array<{ id: string }>>(
        `orders?id=eq.${encodeURIComponent(String(requestedOrderId))}&user_id=eq.${encodeURIComponent(userId)}&select=id`,
        'GET',
      )
      if (!Array.isArray(ownership.data) || ownership.data.length === 0) {
        console.error('Order ownership check failed for user', userId)
        throw ErrorCodes.INVALID_REQUEST_BODY()
      }
    }

    // ✅ CRITICAL FIX #1: Enforce test mode based on environment
    const testModeValidation = validateAndEnforceTestMode(is_test, 'Printify order creation');
    const enforcedTestMode = testModeValidation.testMode;

    // ✅ CRITICAL FIX #2: Validate payment amount if provided
    if (payment_amount !== undefined) {
      const amountValidation = validatePaymentAmount({
        paymentAmount: payment_amount,
        paymentCurrency: payment_currency || 'USD',
        subtotal,
        shippingCost: shipping_cost,
        discount,
      });

      if (!amountValidation.isValid) {
        console.error('❌ AMOUNT VALIDATION FAILED:', amountValidation.errorMessage);
        throw ErrorCodes.INVALID_REQUEST_BODY();
      }

      console.log(`✅ Amount validation passed: ${payment_currency || 'USD'} ${payment_amount}`);
    }

    // Use shipping_address if address_to is not provided
    let finalAddressTo = address_to || shipping_address

    console.log('=== CREATE PRINTIFY ORDER ===')
    // Avoid logging full request body / shipping address (customer PII).
    console.log('📦 Line items count:', Array.isArray(line_items) ? line_items.length : 0)
    console.log('🧪 Is test (client):', is_test)
    console.log('🧪 Is test (enforced):', enforcedTestMode)
    console.log('📝 Use sample order:', use_sample_order)
    console.log('🔄 Auto cancel:', auto_cancel)
    console.log('ℹ️  Metadata:', JSON.stringify(metadata, null, 2))

    // Validate Printify configuration
    const PRINTIFY_API_TOKEN = validateEnvVars.printifyToken()
    const PRINTIFY_SHOP_ID = validateEnvVars.printifyShopId()

    // If no line items and not requesting a sample order, skip
    if ((!line_items || line_items.length === 0) && !use_sample_order) {
      console.log('No line items provided, skipping order creation')
      return new Response(
        JSON.stringify({ success: true, message: 'No line items to process', skipped: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use test address if none provided
    if (!finalAddressTo || !finalAddressTo.address1) {
      console.log('Using test shipping address')
      finalAddressTo = TEST_SHIPPING_ADDRESS
    }

    const externalId = `${enforcedTestMode ? 'test-' : ''}order-${Date.now()}`

    // First, we need to get a real product from the shop to create an order
    // Fetch products from Printify
    console.log('Fetching products from Printify shop...')
    const productsResponse = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`,
      {
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
        },
      }
    )
    
    const productsData = await productsResponse.json()
    console.log('Products response:', JSON.stringify(productsData, null, 2))

    let formattedLineItems = []

    if (line_items && line_items.length > 0) {
      // Use provided line items with print_areas support
      formattedLineItems = await Promise.all(line_items.map(async (item: any, index: number) => {
        console.log(`Processing line item ${index}:`, JSON.stringify(item, null, 2))

        // CRITICAL VALIDATION: Printify API requires blueprint_id when print_provider_id is present
        if (item.print_provider_id && !item.blueprint_id) {
          console.error(`❌ Line item ${index} has print_provider_id but missing blueprint_id - INVALID!`)
          throw ErrorCodes.PRINTIFY_ORDER_API_ERROR(
            `Line item ${index}: blueprint_id is required when print_provider_id is present`
          )
        }

        // If we have a product_id, we're ordering an EXISTING product
        // For existing products, we should NOT include print_provider_id or blueprint_id
        if (item.product_id) {
          console.log(`✅ Line item ${index}: Ordering existing product: ${item.product_id}`)

          // Verify the product exists in Printify before creating order
          try {
            const productCheckResponse = await fetch(
              `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${item.product_id}.json`,
              {
                headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` },
              }
            )

            if (!productCheckResponse.ok) {
              if (productCheckResponse.status === 404) {
                console.error(`❌ Product ${item.product_id} not found in Printify shop`)
                throw ErrorCodes.PRINTIFY_ORDER_API_ERROR(
                  `Product ${item.product_id} no longer exists in Printify. Please recreate the product.`
                )
              }
              throw new Error(`Failed to verify product: ${productCheckResponse.status}`)
            }

            console.log(`✅ Product ${item.product_id} verified in Printify`)
          } catch (verifyError: any) {
            if (verifyError.errorId) {
              throw verifyError // Re-throw ErrorCodes errors
            }
            throw ErrorCodes.PRINTIFY_ORDER_API_ERROR(
              `Failed to verify product ${item.product_id}: ${verifyError.message}`
            )
          }

          const lineItem: any = {
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity || 1,
          }
          // Ensure we don't accidentally include blueprint fields for existing products
          return lineItem
        }

        // If we have a blueprint_id, we're CREATING a product with the order (on-the-fly)
        // For this, we need: print_provider_id, blueprint_id, variant_id, print_areas
        if (item.blueprint_id) {
          console.log(`✅ Line item ${index}: Creating product on-the-fly with blueprint: ${item.blueprint_id}`)
          const printProviderId = item.print_provider_id || 99 // Default to Printify Choice

          const lineItem: any = {
            print_provider_id: printProviderId,
            blueprint_id: item.blueprint_id,
            variant_id: item.variant_id,
            quantity: item.quantity || 1,
          }

          // Add print_areas for the design
          if (item.print_areas) {
            lineItem.print_areas = item.print_areas
          }

          // Add print_details if provided
          if (item.print_details) {
            lineItem.print_details = item.print_details
          }

          console.log(`✅ Line item ${index}: Built custom product:`, lineItem)
          return lineItem
        }

        // Fallback: if we have SKU, use that
        if (item.sku) {
          console.log(`✅ Line item ${index}: Ordering by SKU: ${item.sku}`)
          return {
            sku: item.sku,
            quantity: item.quantity || 1,
          }
        }

        // If nothing matches, this is an error - don't send invalid data to Printify
        console.error(`❌ Line item ${index}: Invalid format - no product_id, blueprint_id, or sku`)
        console.error(`Item data:`, item)
        throw ErrorCodes.PRINTIFY_ORDER_API_ERROR(
          `Line item ${index}: must have either product_id, blueprint_id, or sku`
        )
      }))
    } else if (use_sample_order && productsData.data && productsData.data.length > 0) {
      // Use first available product for sample order
      const firstProduct = productsData.data[0]
      const firstVariant = firstProduct.variants?.find((v: any) => v.is_enabled) || firstProduct.variants?.[0]
      
      if (firstProduct && firstVariant) {
        console.log(`Using product: ${firstProduct.title} (${firstProduct.id})`)
        console.log(`Using variant: ${firstVariant.id}`)
        // ✅ IMPORTANT: When using product_id, do NOT include print_provider_id or blueprint_id
        formattedLineItems = [{
          product_id: firstProduct.id,
          variant_id: firstVariant.id,
          quantity: 1,
          // print_provider_id: REMOVED - not allowed with product_id
        }]
      } else {
        throw ErrorCodes.NO_PRODUCTS_IN_SHOP()
      }
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No products in shop. Please create a product in Printify first.',
          products_count: productsData.data?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const orderPayload = {
      external_id: externalId,
      label: metadata?.order_id || externalId,
      line_items: formattedLineItems,
      shipping_method: shipping_method || 1,
      send_shipping_notification: false, // Don't send emails for test orders
      is_printify_express: false,
      address_to: {
        first_name: finalAddressTo.first_name || 'Customer',
        last_name: finalAddressTo.last_name || '',
        email: finalAddressTo.email || 'test@example.com',
        phone: finalAddressTo.phone || '',
        country: finalAddressTo.country || 'US',
        region: finalAddressTo.region || '',
        address1: finalAddressTo.address1,
        address2: finalAddressTo.address2 || '',
        city: finalAddressTo.city,
        zip: finalAddressTo.zip || '',
      },
    }

    console.log('Sending order to Printify:', JSON.stringify(orderPayload, null, 2))

    // Create order in Printify
    const response = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/orders.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      }
    )

    const data = await response.json()

    console.log('Printify API response status:', response.status)
    console.log('Printify API response:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error('Printify API error:', data)

      // Update order status to "unsuccessful_confirmation" if we have an order_id
      const orderId = metadata?.order_id
      console.log('📋 Metadata:', JSON.stringify(metadata, null, 2))
      console.log('🔍 Order ID from metadata:', orderId)

      if (orderId) {
        try {
          console.log(`🔄 Updating order ${orderId} status to unsuccessful_confirmation...`)
          const statusUpdateResult = await supabaseRest(
            'rpc/update_order_payment_status_atomic',
            'POST',
            {
              p_order_id: orderId,
              p_payment_status: 'paid',
              p_order_status: 'unsuccessful_confirmation',
            }
          )

          console.log('📊 Status update result:', JSON.stringify(statusUpdateResult, null, 2))

          if (statusUpdateResult.error) {
            console.error(`❌ Failed to update order ${orderId} status to unsuccessful_confirmation:`, statusUpdateResult.error)
          } else {
            console.log(`✅ Order ${orderId} status updated to unsuccessful_confirmation`)
          }
        } catch (updateError) {
          console.error('❌ Exception updating order status:', updateError)
        }
      } else {
        console.warn('⚠️ No order_id in metadata, cannot update order status to unsuccessful_confirmation')
      }

      throw ErrorCodes.PRINTIFY_ORDER_API_ERROR(JSON.stringify(data))
    }

    console.log(`✅ ${enforcedTestMode ? 'TEST' : 'PRODUCTION'} order created:`, data.id)

    // Update order status to "confirmed" if we have an order_id
    const orderId = metadata?.order_id
    console.log('📋 Metadata:', JSON.stringify(metadata, null, 2))
    console.log('🔍 Order ID from metadata:', orderId)

    if (orderId) {
      try {
        console.log(`🔄 Updating order ${orderId} status to confirmed...`)
        const statusUpdateResult = await supabaseRest(
          'rpc/update_order_payment_status_atomic',
          'POST',
          {
            p_order_id: orderId,
            p_payment_status: 'paid',
            p_order_status: 'confirmed',
          }
        )

        console.log('📊 Status update result:', JSON.stringify(statusUpdateResult, null, 2))

        if (statusUpdateResult.error) {
          console.error(`❌ Failed to update order ${orderId} status to confirmed:`, statusUpdateResult.error)
        } else {
          console.log(`✅ Order ${orderId} status updated to confirmed`)
        }
      } catch (updateError) {
        console.error('❌ Exception updating order status:', updateError)
      }
    } else {
      console.warn('⚠️ No order_id in metadata, cannot update order status')
    }

    // Auto-cancel order if requested (useful for testing)
    let cancelResult = null
    if (auto_cancel) {
      console.log('🔄 Auto-canceling order:', data.id)
      try {
        const cancelResponse = await fetch(
          `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/orders/${data.id}/cancel.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        )

        const cancelData = await cancelResponse.json()

        if (cancelResponse.ok) {
          console.log('✅ Order auto-canceled successfully')
          cancelResult = { success: true, canceled: true, status: cancelData.status }
        } else {
          console.warn('⚠️ Failed to auto-cancel order:', cancelData)
          cancelResult = { success: false, error: cancelData.errors?.reason || 'Unknown error' }
        }
      } catch (cancelError: any) {
        console.error('❌ Error auto-canceling order:', cancelError)
        cancelResult = { success: false, error: cancelError?.message || 'Unknown error' }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: data,
        ...(cancelResult && { cancel_result: cancelResult })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating Printify order:', error)
    return handleError(error, corsHeaders)
  }
})