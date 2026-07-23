import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Default print provider (Printify Choice)
const DEFAULT_PRINT_PROVIDER_ID = 99

interface BlueprintData {
  id: number
  title: string
  description: string
  brand: string
  model: string
  images: string[]
}

interface VariantData {
  id: number
  title: string
  options: {
    color?: string
    size?: string
  }
  price: number
}

/**
 * Sync Blueprint Edge Function
 *
 * Fetches blueprint data (including images and variants) from Printify API
 * and updates the catalog_products and product_variants tables.
 *
 * Request body:
 * - blueprint_id: number (required)
 * - print_provider_id: number (optional, defaults to 99)
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { blueprint_id, print_provider_id } = await req.json()

    console.log('=== SYNC BLUEPRINT ===')
    console.log('Blueprint ID:', blueprint_id)

    // Validate environment variables and request data
    const PRINTIFY_API_TOKEN = validateEnvVars.printifyToken()
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL) {
      throw ErrorCodes.SUPABASE_URL_MISSING()
    }
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw ErrorCodes.SUPABASE_SERVICE_ROLE_KEY_MISSING()
    }

    const validBlueprintId = validateRequest.blueprintId(blueprint_id)
    const providerId = print_provider_id || DEFAULT_PRINT_PROVIDER_ID

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch blueprint info from Printify
    console.log('Fetching blueprint data from Printify...')
    const blueprintResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${validBlueprintId}.json`,
      { headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` } }
    )

    if (!blueprintResponse.ok) {
      const errorData = await blueprintResponse.json()
      throw ErrorCodes.PRINTIFY_API_ERROR(`Blueprint fetch failed: ${JSON.stringify(errorData)}`)
    }

    const blueprintData: BlueprintData = await blueprintResponse.json()
    console.log(`Blueprint: ${blueprintData.title}`)
    console.log(`Images: ${blueprintData.images?.length || 0}`)

    // Get the first image URL
    const baseImageUrl = blueprintData.images?.[0] || null
    console.log(`Base image URL: ${baseImageUrl}`)

    // Fetch variants from Printify
    console.log(`Fetching variants for provider ${providerId}...`)
    const variantsResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${validBlueprintId}/print_providers/${providerId}/variants.json`,
      { headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` } }
    )

    let variants: VariantData[] = []
    let minPriceCents = 0

    if (variantsResponse.ok) {
      const variantsData = await variantsResponse.json()
      variants = variantsData.variants || []

      // Calculate minimum price
      if (variants.length > 0) {
        minPriceCents = Math.min(...variants.map(v => v.price || 0))
      }
      console.log(`Found ${variants.length} variants, min price: ${minPriceCents} cents`)
    } else {
      console.log('Failed to fetch variants, continuing without them')
    }

    // Update catalog_products table
    console.log('Updating catalog_products...')
    const { error: productError } = await supabase
      .from('catalog_products')
      .upsert({
        blueprint_id: validBlueprintId,
        display_title: blueprintData.title,
        base_image_url: baseImageUrl,
        min_price_cents: minPriceCents,
        print_provider_id: providerId,
        last_synced_at: new Date().toISOString(),
      }, {
        onConflict: 'blueprint_id',
        ignoreDuplicates: false,
      })

    if (productError) {
      console.error('Error updating catalog_products:', productError)
      throw new Error(`Database error: ${productError.message}`)
    }

    // Update product_variants table
    if (variants.length > 0) {
      console.log('Updating product_variants...')

      const variantRows = variants.map(v => {
        const color = v.options?.color || v.title.split(' / ')[0]?.trim() || null
        const size = v.options?.size || v.title.split(' / ')[1]?.trim() || null

        return {
          blueprint_id: validBlueprintId,
          printify_variant_id: v.id,
          color,
          size,
          price_cents: v.price || 0,
          is_available: true,
          updated_at: new Date().toISOString(),
        }
      })

      const { error: variantsError } = await supabase
        .from('product_variants')
        .upsert(variantRows, {
          onConflict: 'blueprint_id,printify_variant_id',
          ignoreDuplicates: false,
        })

      if (variantsError) {
        console.error('Error updating product_variants:', variantsError)
        // Don't throw, just log - we still synced the product
      } else {
        console.log(`Synced ${variantRows.length} variants`)
      }
    }

    console.log('=== SYNC COMPLETE ===')

    return new Response(
      JSON.stringify({
        success: true,
        blueprint_id: validBlueprintId,
        title: blueprintData.title,
        base_image_url: baseImageUrl,
        variants_count: variants.length,
        min_price_cents: minPriceCents,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error syncing blueprint:', error)
    return handleError(error, corsHeaders)
  }
})
