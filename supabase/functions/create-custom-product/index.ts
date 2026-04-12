import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

// Environment variables will be validated when needed

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Initialize Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const {
      blueprint_id,
      print_provider_id,
      image_id,
      print_areas,
      title,
      description,
      variants,
      selected_color,
      selected_size,

      // ➕ Order-related fields from client
      user_id,
      customer_email
    } = await req.json()

    console.log('=== CREATE CUSTOM PRODUCT ===')
    console.log('🎨 Selected color:', selected_color)
    console.log('📏 Selected size:', selected_size)

    // Validate environment variables
    const PRINTIFY_API_TOKEN = validateEnvVars.printifyToken()
    const PRINTIFY_SHOP_ID = validateEnvVars.printifyShopId()

    // Support both legacy image_id and new print_areas format
    const frontImageId = print_areas?.front || image_id
    const backImageId = print_areas?.back

    const validBlueprintId = validateRequest.blueprintId(blueprint_id)
    const validPrintProviderId = validateRequest.printProviderId(print_provider_id)

    if (!frontImageId && !backImageId) {
      throw ErrorCodes.IMAGE_REQUIRED()
    }

    const finalBlueprintId = validBlueprintId
    const finalPrintProviderId = validPrintProviderId

    // Get print provider variants
    const variantsResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${finalBlueprintId}/print_providers/${finalPrintProviderId}/variants.json`,
      {
        headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` },
      }
    )
    const variantsData = await variantsResponse.json()
    
    const availableVariants = variantsData.variants || []
    if (availableVariants.length === 0) {
      throw ErrorCodes.NO_VARIANTS_AVAILABLE()
    }

    // Filter variants by selected color and size if provided
    let selectedVariants: number[] = []

    if (variants && variants.length > 0) {
      // Use explicitly provided variant IDs
      selectedVariants = variants
    } else if (selected_color || selected_size) {
      // Filter variants by selected color and/or size
      console.log(`🎨 Filtering variants by color: "${selected_color}", size: "${selected_size}"`)

      const matchingVariants = availableVariants.filter((v: any) => {
        // Extract color and size from variant options or title
        const variantColor = v.options?.color || v.title?.split(' / ')[0]?.trim()
        const variantSize = v.options?.size || v.title?.split(' / ')[1]?.trim()

        const colorMatches = !selected_color ||
          variantColor?.toLowerCase() === selected_color.toLowerCase()
        const sizeMatches = !selected_size ||
          variantSize?.toLowerCase() === selected_size.toLowerCase()

        return colorMatches && sizeMatches
      })

      if (matchingVariants.length > 0) {
        selectedVariants = matchingVariants.map((v: any) => v.id)
        console.log(`✅ Found ${selectedVariants.length} matching variant(s): ${selectedVariants.join(', ')}`)
      } else {
        // Fallback to first 100 if no match found
        console.warn(`⚠️ No variants match color: "${selected_color}", size: "${selected_size}". Using defaults.`)
        selectedVariants = availableVariants.slice(0, 100).map((v: any) => v.id)
      }
    } else {
      // No filter specified, use first 100 variants
      selectedVariants = availableVariants.slice(0, 100).map((v: any) => v.id)
    }

    // Build placeholders
    const placeholders = []

    if (frontImageId) {
      placeholders.push({
        position: 'front',
        images: [{ id: frontImageId, x: 0.5, y: 0.5, scale: 1, angle: 0 }],
      })
    }

    if (backImageId) {
      placeholders.push({
        position: 'back',
        images: [{ id: backImageId, x: 0.5, y: 0.5, scale: 1, angle: 0 }],
      })
    }

    // IMPORTANT: Printify API requires all prices to be integers (in cents)
    // Example: $29.99 should be sent as 2999 (not 29.99)
    const productPayload = {
      title: title || `Custom Design ${Date.now()}`,
      description: description || 'Custom designed product',
      blueprint_id: finalBlueprintId,
      print_provider_id: finalPrintProviderId,
      variants: selectedVariants.map((variantId: number) => ({
        id: variantId,
        price: 1, // Price in cents (1 cent = $0.01) - MUST be an integer
        is_enabled: true,
      })),
      print_areas: [
        {
          variant_ids: selectedVariants,
          placeholders,
        }
      ],
    }

    // 🚀 Create Printify product
    const createResponse = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productPayload),
      }
    )

    const productData = await createResponse.json()

    if (!createResponse.ok) {
      console.error('Failed to create product:', productData)
      throw ErrorCodes.PRINTIFY_API_ERROR(JSON.stringify(productData))
    }

    console.log('✅ Product created:', productData.id)

    const productImageUrl = productData.images?.[0]?.src || null

    // 🧾 Create order in database
    const orderNumber = `ORD-${Date.now()}`
    const orderPayload = {
      user_id,
      product_id: productData.id,
      order_number: orderNumber,
      customer_email: customer_email,
      // Use a status allowed by the DB constraint
      status: "pending",
    }

    console.log('✅ Creating the order with the product:', productData.id)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single()

    if (orderError) {
      console.error("❌ Failed to create order:", orderError)
      throw ErrorCodes.DATABASE_ERROR(orderError.message)
    }

    console.log("🧾 Order created:", order.id)

    // 🧾 Create order item so the order shows items in "My Orders"
    const firstEnabledVariant = productData.variants?.find((v: any) => v.is_enabled) || productData.variants?.[0]
    const unitPrice = firstEnabledVariant ? (firstEnabledVariant.price / 100) : 0
    const orderItemPayload = {
      order_id: order.id,
      product_name: productData.title || "Custom T-Shirt",
      custom_image_url: productImageUrl || "",
      quantity: 1,
      unit_price: unitPrice,
      total_price: unitPrice,
      variant_id: firstEnabledVariant ? String(firstEnabledVariant.id) : null,
      variant_name: firstEnabledVariant?.title || null,
      design_config: null,
      fulfillment_status: null,
      external_order_id: null,
    }

    const { error: orderItemError } = await supabase
      .from("order_items")
      .insert(orderItemPayload)

    if (orderItemError) {
      // Non-fatal — log but don't fail the whole request
      console.warn("⚠️ Failed to create order item:", orderItemError.message)
    } else {
      console.log("🧾 Order item created for order:", order.id)
    }

    // ✅ Return both product and order
    return new Response(
      JSON.stringify({
        success: true,
        product: {
          id: productData.id,
          title: productData.title,
          description: productData.description,
          images: productData.images?.map((img: any) => ({
            src: img.src,
            variant_ids: img.variant_ids,
            position: img.position,
            is_default: img.is_default,
          })) || [],
          variants: productData.variants?.map((v: any) => ({
            id: v.id,
            title: v.title,
            price: v.price,
            is_enabled: v.is_enabled,
          })),
        },
        order,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating custom product:', error)
    return handleError(error, corsHeaders)
  }
})
