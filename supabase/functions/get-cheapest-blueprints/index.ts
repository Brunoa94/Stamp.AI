import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { createServiceClient } from "../_shared/supabase.ts"

const PRINTIFY_API_TOKEN = Deno.env.get('PRINTIFY_API_TOKEN')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Blueprint IDs that support front/back printing
const FRONT_BACK_BLUEPRINT_IDS = [5, 6, 9, 12, 36, 41]

// Prioritized providers to test (most common/reliable ones)
const PRIORITY_PROVIDER_IDS = [99, 30, 27, 29, 6, 39, 41]

// Estimated base costs (in cents) - updated periodically from actual products
// These are approximate costs for basic tees, will vary by variant
const ESTIMATED_COSTS: { [key: string]: number } = {
  '5-99': 850,   // Next Level 3600 via Printify Choice
  '6-99': 900,   // Gildan 5000 via Printify Choice
  '6-30': 880,   // Gildan 5000 via OPT OnDemand
  '9-99': 870,   // Bella+Canvas 6004 via Printify Choice
  '12-99': 920,  // Bella+Canvas 3001 via Printify Choice
  '12-30': 900,  // Bella+Canvas 3001 via OPT OnDemand
  '36-99': 880,  // Gildan 2000 via Printify Choice
  '41-99': 980,  // Bella+Canvas 3501 via Printify Choice
}

interface BlueprintProviderCombination {
  blueprintId: number
  providerId: number
  title: string
  brand: string
  model: string
  providerName: string
  estimatedCost: number // Estimated cost in cents
  shippingCost: number // Shipping to NL in cents
  totalCost: number // estimatedCost + shippingCost
  printAreas: {
    position: string
    width: number
    height: number
  }[]
  images: string[]
}

async function testBlueprintProvider(
  blueprintId: number,
  providerId: number
): Promise<BlueprintProviderCombination | null> {
  try {
    // 1. Get blueprint info
    const blueprintResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${blueprintId}.json`,
      { headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` } }
    )

    if (!blueprintResponse.ok) return null
    const blueprintData = await blueprintResponse.json()

    // 2. Get variants for this provider
    const variantsResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${providerId}/variants.json`,
      { headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` } }
    )

    if (!variantsResponse.ok) return null
    const variantsData = await variantsResponse.json()

    if (!variantsData.variants || variantsData.variants.length === 0) {
      return null
    }

    // 3. Get provider name
    const providersResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`,
      { headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` } }
    )

    const providers = providersResponse.ok ? await providersResponse.json() : []
    const providerInfo = providers.find((p: any) => p.id === providerId)

    // 4. Check for front/back print areas
    const firstVariant = variantsData.variants[0]
    if (!firstVariant.placeholders) return null

    const printAreas = firstVariant.placeholders
      .map((p: any) => ({
        position: p.position,
        width: p.width,
        height: p.height,
      }))

    // Must have both front and back
    const hasFront = printAreas.some((p: any) => p.position === 'front')
    const hasBack = printAreas.some((p: any) => p.position === 'back')
    if (!hasFront || !hasBack) return null

    // 5. Get estimated cost
    const costKey = `${blueprintId}-${providerId}`
    let estimatedCost = ESTIMATED_COSTS[costKey] || 950 // Default fallback

    // 6. Get shipping cost to Netherlands
    let shippingCost = 0
    try {
      const shippingResponse = await fetch(
        `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${providerId}/shipping.json`,
        { headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` } }
      )

      if (shippingResponse.ok) {
        const shippingData = await shippingResponse.json()

        // Find Netherlands shipping cost
        if (shippingData.profiles && shippingData.profiles.length > 0) {
          const profile = shippingData.profiles[0]

          if (profile.countries) {
            const nlShipping = profile.countries.find((c: any) => c.code === 'NL')
            if (nlShipping) {
              shippingCost = nlShipping.first_item?.cost || 0
            }
          }
        }
      }
    } catch (e) {
      console.log(`Shipping info not available for blueprint ${blueprintId}, provider ${providerId}`)
      // Default shipping estimate for NL
      shippingCost = 600 // $6.00 fallback
    }

    return {
      blueprintId,
      providerId,
      title: blueprintData.title,
      brand: blueprintData.brand,
      model: blueprintData.model,
      providerName: providerInfo?.title || `Provider ${providerId}`,
      estimatedCost,
      shippingCost,
      totalCost: estimatedCost + shippingCost,
      printAreas,
      images: blueprintData.images || [],
    }

  } catch (error) {
    console.error(`Error testing blueprint ${blueprintId} with provider ${providerId}:`, error)
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    console.log('=== GET CHEAPEST BLUEPRINTS FOR NETHERLANDS ===')

    if (!PRINTIFY_API_TOKEN) {
      throw ErrorCodes.PRINTIFY_TOKEN_MISSING()
    }

    const allCombinations: BlueprintProviderCombination[] = []

    // Test all blueprint/provider combinations
    for (const blueprintId of FRONT_BACK_BLUEPRINT_IDS) {
      console.log(`\nTesting blueprint ${blueprintId}...`)

      for (const providerId of PRIORITY_PROVIDER_IDS) {
        const result = await testBlueprintProvider(blueprintId, providerId)

        if (result) {
          allCombinations.push(result)
          console.log(`  ✓ Provider ${providerId} (${result.providerName}): $${(result.totalCost / 100).toFixed(2)} (product: $${(result.estimatedCost / 100).toFixed(2)} + shipping: $${(result.shippingCost / 100).toFixed(2)})`)
        }

        // Rate limiting - be nice to the API
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    console.log(`\nFound ${allCombinations.length} valid blueprint/provider combinations`)

    // Sort by total cost and get top 4
    const cheapest4 = allCombinations
      .filter(c => c.totalCost > 0)
      .sort((a, b) => a.totalCost - b.totalCost)
      .slice(0, 4)

    console.log('\n🏆 Top 4 Cheapest Options for Netherlands:')
    cheapest4.forEach((c, idx) => {
      console.log(
        `${idx + 1}. ${c.title} via ${c.providerName}: $${(c.totalCost / 100).toFixed(2)}`
      )
    })

    // Transform to the expected format
    const blueprints = cheapest4.map(c => ({
      id: c.blueprintId,
      title: c.title,
      description: `${c.brand} ${c.model}`,
      brand: c.brand,
      model: c.model,
      images: c.images,
      printAreas: c.printAreas,
      min_price: c.estimatedCost,
      print_provider_id: c.providerId,
      provider_name: c.providerName,
      shipping_cost: c.shippingCost,
      total_cost: c.totalCost,
    }))

    // Cache the results in the database
    try {
      const supabase = createServiceClient()
      const countryCode = 'NL'

      // Delete old cache entries for this country
      const { error: deleteError } = await supabase
        .from('products_provider')
        .delete()
        .eq('country_code', countryCode)

      if (deleteError) {
        console.error('Error deleting old cache:', deleteError)
      }

      // Insert new cache entries with 24-hour expiration
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      const cacheEntries = cheapest4.map((c, index) => ({
        country_code: countryCode,
        blueprint_id: c.blueprintId,
        print_provider_id: c.providerId,
        title: c.title,
        description: `${c.brand} ${c.model}`,
        brand: c.brand,
        model: c.model,
        images: c.images,
        print_areas: c.printAreas,
        min_price: c.estimatedCost,
        provider_name: c.providerName,
        shipping_cost: c.shippingCost,
        total_cost: c.totalCost,
        rank: index + 1, // 1-4 based on cost ranking
        expires_at: expiresAt,
      }))

      const { error: insertError } = await supabase
        .from('products_provider')
        .insert(cacheEntries)

      if (insertError) {
        console.error('Error caching blueprints:', insertError)
        // Don't fail the request if caching fails
      } else {
        console.log(`✅ Cached ${cacheEntries.length} blueprints for ${countryCode}, expires at ${expiresAt}`)
      }
    } catch (cacheError) {
      console.error('Error during cache operation:', cacheError)
      // Don't fail the request if caching fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        blueprints,
        country: 'NL',
        total_tested: allCombinations.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error finding cheapest blueprints:', error)
    return handleError(error, corsHeaders)
  }
})
