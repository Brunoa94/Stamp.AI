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

      // ➕ Order-related fields from client
      user_id,
      customer_email
    } = await req.json()

    console.log('=== CREATE CUSTOM PRODUCT ===')

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

    const selectedVariants = variants && variants.length > 0
      ? variants
      : availableVariants.slice(0, 100).map((v: any) => v.id)

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

    const productPayload = {
      title: title || `Custom Design ${Date.now()}`,
      description: description || 'Custom designed product',
      blueprint_id: finalBlueprintId,
      print_provider_id: finalPrintProviderId,
      variants: selectedVariants.map((variantId: number) => ({
        id: variantId,
        price: 2500,
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
    const orderPayload = {
      user_id,
      product_id: productData.id,
      customer_email: customer_email,
      status: "created",
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
