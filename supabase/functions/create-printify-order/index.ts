import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const PRINTIFY_API_TOKEN = Deno.env.get('NEXT_PUBLIC_PRINTIFY_API_TOKEN')
const PRINTIFY_SHOP_ID = Deno.env.get('NEXT_PUBLIC_PRINTIFY_SHOP_ID')

serve(async (req) => {
  try {
    const { 
      line_items, 
      shipping_method, 
      address_to,
      is_test = true, // Default to test mode for safety
      // ... other order details
    } = await req.json()

    // Create order in Printify
    const response = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/orders.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_id: `${is_test ? 'test-' : ''}order-${Date.now()}`, // Prefix test orders
          line_items: line_items,
          shipping_method: shipping_method,
          address_to: address_to,
          send_shipping_notification: false, // Don't send notifications for test orders
          send_order_confirmation: false, // Don't send confirmations for test orders
          // Add other required fields
        }),
      }
    )

    const data = await response.json()

    console.log(`${is_test ? 'TEST' : 'PRODUCTION'} order created:`, {
      external_id: `${is_test ? 'test-' : ''}order-${Date.now()}`,
      printify_order_id: data.id,
      is_test: is_test
    })

    if (!response.ok) {
      throw new Error(`Printify API error: ${JSON.stringify(data)}`)
    }

    return new Response(
      JSON.stringify({ success: true, order: data }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})