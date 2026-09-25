import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts"
import { validateEnvVars } from "../_shared/validators.ts"
import { requireUser } from "../_shared/authGuard.ts"
import { validateAndEnforceTestMode } from "../_shared/testModeSafeguard.ts"
import { validatePaymentAmount } from "../_shared/amountValidator.ts"
import { supabaseRest } from "../_shared/supabase.ts"
import { insertOrderStatusHistory } from "../_shared/orderStatusHistory.ts"
import { verifyPaidPayment } from "../_shared/verifyPaidPayment.ts"
import { requirePaymentCurrency } from "../_shared/paymentProof.ts"
import {
  assertLineItemsMatchOrderItems,
  claimOrderFulfillment,
  setOrderPrintifyOrderId,
} from "../_shared/orderFulfillment.ts"
import { corsHeadersFor } from '../_shared/cors.ts'

// Environment variables will be validated when needed

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type PaymentProviderT = 'stripe' | 'paypal' | 'mollie'

const PAYMENT_PROVIDERS: PaymentProviderT[] = ['stripe', 'paypal', 'mollie']

/** payment_transactions column holding the provider payment reference. */
const PROVIDER_REFERENCE_COLUMN: Record<PaymentProviderT, string> = {
  stripe: 'stripe_payment_intent_id',
  paypal: 'paypal_order_id',
  mollie: 'mollie_payment_id',
}

interface FulfillableOrderI {
  id: string
  user_id: string | null
  currency: string | null
  total_amount: number | null
  printify_order_id: string | null
}

interface OrderItemRowI {
  variant_id: string | null
  quantity: number
  product_id: string | null
}

interface PaymentTransactionOwnerI {
  user_id: string | null
  order_id: string | null
}

/**
 * Load the order that a normal end user wants to fulfill. Scoped to the
 * caller's user_id so nobody can fulfill (or mark paid) another user's order.
 */
async function loadOwnedOrder(orderId: string, userId: string): Promise<FulfillableOrderI> {
  const result = await supabaseRest<FulfillableOrderI[]>(
    `orders?id=eq.${encodeURIComponent(orderId)}&user_id=eq.${encodeURIComponent(userId)}&select=id,user_id,currency,total_amount,printify_order_id`,
    'GET',
  )
  if (result.error) throw new Error('Could not load order')
  const order = result.data?.[0]
  if (!order) {
    throw new FunctionError(403, 'FORBIDDEN', 'Order not found for this user')
  }
  return order
}

async function loadOrderItems(orderId: string): Promise<OrderItemRowI[]> {
  const result = await supabaseRest<OrderItemRowI[]>(
    `order_items?order_id=eq.${encodeURIComponent(orderId)}&select=variant_id,quantity,product_id`,
    'GET',
  )
  if (result.error) throw new Error('Could not load order items')
  return result.data ?? []
}

/**
 * Prove, with server credentials, that the referenced provider payment belongs
 * to the caller, is completed, and pays exactly this order (currency + amount),
 * and that the payment has not already been used to fulfill a different order.
 */
async function verifyOrderPayment(
  order: FulfillableOrderI,
  provider: PaymentProviderT,
  paymentId: string,
  userId: string,
): Promise<void> {
  const payment = await verifyPaidPayment(provider, paymentId, userId)
  requirePaymentCurrency(payment, order.currency ?? '')
  if (Math.abs(payment.amount - Number(order.total_amount)) >= 0.005) {
    throw ErrorCodes.ORDER_AMOUNT_MISMATCH()
  }

  const column = PROVIDER_REFERENCE_COLUMN[provider]
  const result = await supabaseRest<PaymentTransactionOwnerI[]>(
    `payment_transactions?${column}=eq.${encodeURIComponent(paymentId)}&payment_provider=eq.${provider}&select=user_id,order_id`,
    'GET',
  )
  if (result.error) throw new Error('Could not load payment transaction')
  const transactions = result.data ?? []
  if (transactions.length === 0) {
    throw new FunctionError(409, 'MISSING_PAYMENT', 'No payment transaction found for this payment')
  }
  for (const transaction of transactions) {
    if (transaction.user_id !== userId) {
      throw new FunctionError(403, 'FORBIDDEN', 'Payment does not belong to this user')
    }
    if (transaction.order_id && transaction.order_id !== order.id) {
      throw ErrorCodes.PAYMENT_ALREADY_USED()
    }
  }
}

// Test data for when stripe trigger sends empty data (service-role callers only)
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
  const corsHeaders = corsHeadersFor(req)
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    // Verify authentication (accepts user JWT or service role key)
    const authHeader = req.headers.get('authorization')
    const { userId, isServiceRole } = await requireUser(authHeader)

    const requestBody = await req.json()

    const {
      line_items,
      shipping_method,
      shipping_address,
      address_to,
      is_test = true, // Default to test mode for safety; client must explicitly set false for production
      metadata,
    } = requestBody

    // ✅ SECURITY: testing/pricing flags are only honoured for server-to-server
    // callers. An end user must not be able to auto-cancel, order samples or
    // supply their own price breakdown.
    const use_sample_order = isServiceRole ? requestBody.use_sample_order === true : false
    const auto_cancel = isServiceRole ? requestBody.auto_cancel === true : false
    const payment_amount = isServiceRole ? requestBody.payment_amount : undefined
    const { payment_currency, subtotal, shipping_cost, discount } = requestBody

    // Every fulfillment is bound to a database order (UUID).
    const orderId = metadata?.order_id
    if (typeof orderId !== 'string' || !UUID_PATTERN.test(orderId)) {
      throw ErrorCodes.INVALID_REQUEST_BODY()
    }

    // ✅ SECURITY: a normal end user may only fulfill THEIR OWN order, and only
    // after proving (with server-side provider credentials) that the order was
    // actually paid for. Service-role callers (server-to-server, recovery)
    // verify the payment themselves before calling us.
    if (!isServiceRole) {
      const provider = metadata?.provider
      const paymentIntentId = metadata?.payment_intent_id
      if (
        typeof paymentIntentId !== 'string' || !paymentIntentId ||
        typeof provider !== 'string' || !PAYMENT_PROVIDERS.includes(provider as PaymentProviderT)
      ) {
        throw ErrorCodes.INVALID_REQUEST_BODY()
      }
      if (!Array.isArray(line_items) || line_items.length === 0) {
        throw ErrorCodes.NO_LINE_ITEMS()
      }

      const order = await loadOwnedOrder(orderId, userId)
      const orderItems = await loadOrderItems(orderId)
      await verifyOrderPayment(order, provider as PaymentProviderT, paymentIntentId, userId)

      // The Printify order must contain exactly what was paid for.
      assertLineItemsMatchOrderItems(line_items, orderItems)
    }

    // ✅ CRITICAL FIX #1: Enforce test mode based on environment
    const testModeValidation = validateAndEnforceTestMode(is_test, 'Printify order creation');
    const enforcedTestMode = testModeValidation.testMode;

    // ✅ CRITICAL FIX #2: Validate payment amount if provided (service-role only)
    if (payment_amount !== undefined) {
      const amountValidation = validatePaymentAmount({
        paymentAmount: payment_amount,
        paymentCurrency: payment_currency || 'USD',
        subtotal,
        shippingCost: shipping_cost,
        discount,
      });

      if (!amountValidation.isValid) {
        throw ErrorCodes.INVALID_REQUEST_BODY();
      }
    }

    // Use shipping_address if address_to is not provided
    let finalAddressTo = address_to || shipping_address

    // Validate Printify configuration
    const PRINTIFY_API_TOKEN = validateEnvVars.printifyToken()
    const PRINTIFY_SHOP_ID = validateEnvVars.printifyShopId()

    // If no line items and not requesting a sample order, skip
    if ((!line_items || line_items.length === 0) && !use_sample_order) {
      return new Response(
        JSON.stringify({ success: true, message: 'No line items to process', skipped: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!finalAddressTo || !finalAddressTo.address1) {
      // Only server-to-server test flows may fall back to the test address
      if (!isServiceRole) {
        throw ErrorCodes.MISSING_SHIPPING_ADDRESS()
      }
      finalAddressTo = TEST_SHIPPING_ADDRESS
    }

    // Stable, idempotent external id: one Printify order per database order
    const externalId = `${enforcedTestMode ? 'test-' : ''}${orderId}`

    // ✅ Atomic fulfillment claim: from here on this order is "in progress".
    // A second call (double click, replay, concurrent tab) gets a 409.
    await claimOrderFulfillment(orderId)

    let data: any
    try {
      // Fetch products from Printify to verify they exist
      const productsResponse = await fetch(
        `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`,
        {
          headers: {
            'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
          },
        }
      )

      const productsData = await productsResponse.json()

      let formattedLineItems = []

      if (line_items && line_items.length > 0) {
        // Use provided line items with print_areas support
        formattedLineItems = await Promise.all(line_items.map(async (item: any, index: number) => {
          // CRITICAL VALIDATION: Printify API requires blueprint_id when print_provider_id is present
          if (item.print_provider_id && !item.blueprint_id) {
            throw ErrorCodes.PRINTIFY_ORDER_API_ERROR(
              `Line item ${index}: blueprint_id is required when print_provider_id is present`
            )
          }

          // If we have a product_id, we're ordering an EXISTING product
          if (item.product_id) {
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
                  throw ErrorCodes.PRINTIFY_ORDER_API_ERROR(
                    `Product ${item.product_id} no longer exists in Printify. Please recreate the product.`
                  )
                }
                throw new Error(`Failed to verify product: ${productCheckResponse.status}`)
              }
            } catch (verifyError: any) {
              if (verifyError.errorId) {
                throw verifyError
              }
              throw ErrorCodes.PRINTIFY_ORDER_API_ERROR(
                `Failed to verify product ${item.product_id}: ${verifyError.message}`
              )
            }

            return {
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity || 1,
            }
          }

          // If we have a blueprint_id, we're CREATING a product with the order (on-the-fly)
          if (item.blueprint_id) {
            const printProviderId = item.print_provider_id || 99 // Default to Printify Choice

            const lineItem: any = {
              print_provider_id: printProviderId,
              blueprint_id: item.blueprint_id,
              variant_id: item.variant_id,
              quantity: item.quantity || 1,
            }

            if (item.print_areas) {
              lineItem.print_areas = item.print_areas
            }

            if (item.print_details) {
              lineItem.print_details = item.print_details
            }

            return lineItem
          }

          // Fallback: if we have SKU, use that
          if (item.sku) {
            return {
              sku: item.sku,
              quantity: item.quantity || 1,
            }
          }

          throw ErrorCodes.PRINTIFY_ORDER_API_ERROR(
            `Line item ${index}: must have either product_id, blueprint_id, or sku`
          )
        }))
      } else if (use_sample_order && productsData.data && productsData.data.length > 0) {
        // Use first available product for sample order
        const firstProduct = productsData.data[0]
        const firstVariant = firstProduct.variants?.find((v: any) => v.is_enabled) || firstProduct.variants?.[0]

        if (firstProduct && firstVariant) {
          formattedLineItems = [{
            product_id: firstProduct.id,
            variant_id: firstVariant.id,
            quantity: 1,
          }]
        } else {
          throw ErrorCodes.NO_PRODUCTS_IN_SHOP()
        }
      } else {
        throw ErrorCodes.NO_PRODUCTS_IN_SHOP()
      }

      const orderPayload = {
        external_id: externalId,
        label: orderId,
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

      data = await response.json()

      if (!response.ok || typeof data?.id !== 'string' || !data.id) {
        throw ErrorCodes.PRINTIFY_ORDER_API_ERROR(JSON.stringify(data))
      }
    } catch (fulfillmentError) {
      // Release the claim so the order can be retried or refunded
      try {
        await setOrderPrintifyOrderId(orderId, null)
      } catch (releaseError) {
        console.error(`Failed to release fulfillment claim for order ${orderId}:`, releaseError)
      }

      // Update order status to "unsuccessful_confirmation" when Printify rejected the order
      if (fulfillmentError instanceof FunctionError && fulfillmentError.errorId === 'PRINTIFY_ORDER_API_ERROR') {
        try {
          const statusUpdateResult = await supabaseRest(
            'rpc/update_order_payment_status_atomic',
            'POST',
            {
              p_order_id: orderId,
              p_payment_status: 'paid',
              p_order_status: 'unsuccessful_confirmation',
            }
          )
          if (!statusUpdateResult.error) {
            await insertOrderStatusHistory(orderId, 'unsuccessful_confirmation', 'order_creation')
          }
        } catch {
          // Status update is best-effort
        }
      }
      throw fulfillmentError
    }

    // Persist the Printify order id on the order (the browser can no longer
    // write this column). Printify has already accepted the order, so a
    // failure here must NOT release the claim or fail the request: the
    // 'pending' marker stays for operator reconciliation.
    try {
      await setOrderPrintifyOrderId(orderId, data.id)
    } catch (storeError) {
      console.error(`Printify order ${data.id} created but could not be stored on order ${orderId}:`, storeError)
    }

    // Update order status to "confirmed"
    try {
      const statusUpdateResult = await supabaseRest(
        'rpc/update_order_payment_status_atomic',
        'POST',
        {
          p_order_id: orderId,
          p_payment_status: 'paid',
          p_order_status: 'confirmed',
        }
      )
      if (!statusUpdateResult.error) {
        await insertOrderStatusHistory(orderId, 'confirmed', 'order_creation')
      }
    } catch {
      // Status update is best-effort
    }

    // Auto-cancel order if requested (service-role testing only)
    let cancelResult = null
    if (auto_cancel) {
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
          cancelResult = { success: true, canceled: true, status: cancelData.status }
        } else {
          cancelResult = { success: false, error: cancelData.errors?.reason || 'Unknown error' }
        }
      } catch (cancelError: any) {
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
    return handleError(error, corsHeaders)
  }
})
