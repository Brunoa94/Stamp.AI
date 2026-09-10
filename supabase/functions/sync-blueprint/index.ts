import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"
import { buildProductSeoRow } from "../_shared/productSeo.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

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
 * Uses the provider_id stored in catalog_products (set by sync-cheapest-providers job).
 *
 * Request body:
 * - blueprint_id: number (required)
 * - print_provider_id: number (optional, uses stored value from DB if not provided)
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

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get the provider_id - use provided value, or fetch from database
    let providerId = print_provider_id
    if (!providerId) {
      const { data: existingProduct } = await supabase
        .from('catalog_products')
        .select('print_provider_id')
        .eq('blueprint_id', validBlueprintId)
        .single()

      providerId = existingProduct?.print_provider_id || 99 // Default to Printify Choice
    }
    console.log(`Using provider ID: ${providerId}`)

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

    // Get the first image URL and keep the full gallery
    const imageUrls = blueprintData.images || []
    const baseImageUrl = imageUrls[0] || null
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

    // Note: shipping_cents and print_provider_id are set by the sync-cheapest-providers job
    // We only update the fields that come from basic blueprint/variant data here
    // Preserve existing display_title if already set (allows admin overrides via migrations)
    console.log('Updating catalog_products...')

    // Check if product exists and has a custom display_title
    const { data: existingProduct } = await supabase
      .from('catalog_products')
      .select('display_title')
      .eq('blueprint_id', validBlueprintId)
      .single()

    // Only use Printify title if no custom title exists
    const displayTitle = existingProduct?.display_title || blueprintData.title

    const { error: productError } = await supabase
      .from('catalog_products')
      .upsert({
        blueprint_id: validBlueprintId,
        display_title: displayTitle,
        base_image_url: baseImageUrl,
        image_urls: imageUrls,
        min_price_cents: minPriceCents,
        last_synced_at: new Date().toISOString(),
      }, {
        onConflict: 'blueprint_id',
        ignoreDuplicates: false,
      })

    if (productError) {
      console.error('Error updating catalog_products:', productError)
      throw new Error(`Database error: ${productError.message}`)
    }

    // Update product_seo table with the Printify description
    console.log('Updating product_seo...')
    let seoSynced = false
    const { error: seoError } = await supabase
      .from('product_seo')
      .upsert(
        buildProductSeoRow(validBlueprintId, blueprintData.description, new Date().toISOString()),
        {
          onConflict: 'blueprint_id',
          ignoreDuplicates: false,
        }
      )

    if (seoError) {
      console.error('Error updating product_seo:', seoError)
      // Don't throw, just log - we still synced the product
    } else {
      seoSynced = true
      console.log('Synced product SEO description')
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
        images_count: imageUrls.length,
        variants_count: variants.length,
        min_price_cents: minPriceCents,
        print_provider_id: providerId,
        seo_synced: seoSynced,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error syncing blueprint:', error)
    return handleError(error, corsHeaders)
  }
})
