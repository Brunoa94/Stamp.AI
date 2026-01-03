import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"

const PRINTIFY_API_TOKEN = Deno.env.get('PRINTIFY_API_TOKEN')
const PRINTIFY_SHOP_ID = Deno.env.get('PRINTIFY_SHOP_ID')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    console.log('=== GET PRINTIFY PRODUCTS ===')

    if (!PRINTIFY_API_TOKEN) {
      throw ErrorCodes.PRINTIFY_TOKEN_MISSING()
    }

    if (!PRINTIFY_SHOP_ID) {
      throw ErrorCodes.PRINTIFY_SHOP_ID_MISSING()
    }

    // Fetch products from Printify
    const response = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`,
      {
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw ErrorCodes.PRINTIFY_API_ERROR(JSON.stringify(data))
    }

    // Transform products to a simpler format
    const products = (data.data || []).map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      tags: product.tags,
      images: product.images?.map((img: any) => ({
        src: img.src,
        position: img.position,
        is_default: img.is_default,
      })) || [],
      variants: product.variants?.map((variant: any) => ({
        id: variant.id,
        title: variant.title,
        price: variant.price,
        cost: variant.cost,
        is_enabled: variant.is_enabled,
        is_available: variant.is_available,
        options: variant.options,
      })) || [],
      print_areas: product.print_areas,
      blueprint_id: product.blueprint_id,
      print_provider_id: product.print_provider_id,
    }))

    console.log(`Found ${products.length} products`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        products,
        total: data.total || products.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching products:', error)
    return handleError(error, corsHeaders)
  }
})
