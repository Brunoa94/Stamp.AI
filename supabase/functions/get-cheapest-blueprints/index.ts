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
const FRONT_BACK_BLUEPRINT_IDS = [49, 145, 157, 553]

// Preferred provider (will fallback to cheapest if not available)
const PREFERRED_PROVIDER_ID = 402

// Country code for shipping calculations
const COUNTRY_CODE = 'NL'

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

async function getAvailableProviders(blueprintId: number): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`,
      { headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` } }
    )

    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.error(`Error fetching providers for blueprint ${blueprintId}:`, error)
    return []
  }
}

async function getShippingCost(
  blueprintId: number,
  providerId: number,
  countryCode: string
): Promise<number> {
  try {
    const response = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${providerId}/shipping.json`,
      { headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` } }
    )

    if (!response.ok) return 600 // Default fallback

    const data = await response.json()
    if (data.profiles && data.profiles.length > 0) {
      const profile = data.profiles[0]
      if (profile.countries) {
        const shipping = profile.countries.find((c: any) => c.code === countryCode)
        if (shipping) {
          return shipping.first_item?.cost || 0
        }
      }
    }
    return 600 // Default fallback
  } catch (e) {
    return 600 // Default fallback
  }
}

async function findCheapestProvider(
  blueprintId: number,
  providers: any[]
): Promise<number | null> {
  console.log(`  Finding cheapest provider for blueprint ${blueprintId}...`)

  const providerCosts: { id: number; name: string; cost: number }[] = []

  for (const provider of providers) {
    const shippingCost = await getShippingCost(blueprintId, provider.id, COUNTRY_CODE)
    providerCosts.push({
      id: provider.id,
      name: provider.title,
      cost: shippingCost,
    })
    await new Promise(resolve => setTimeout(resolve, 100)) // Rate limiting
  }

  if (providerCosts.length === 0) return null

  // Sort by shipping cost and pick the cheapest
  providerCosts.sort((a, b) => a.cost - b.cost)
  console.log(`  Cheapest provider: ${providerCosts[0].name} (ID: ${providerCosts[0].id}) - $${(providerCosts[0].cost / 100).toFixed(2)} shipping`)

  return providerCosts[0].id
}

async function testBlueprintProvider(
  blueprintId: number,
  providerId: number,
  blueprintData?: any
): Promise<BlueprintProviderCombination | null> {
  try {
    // 1. Get blueprint info (if not already provided)
    let blueprint = blueprintData
    if (!blueprint) {
      const blueprintResponse = await fetch(
        `https://api.printify.com/v1/catalog/blueprints/${blueprintId}.json`,
        { headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` } }
      )

      if (!blueprintResponse.ok) return null
      blueprint = await blueprintResponse.json()
    }

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

    // 3. Get provider info
    const providers = await getAvailableProviders(blueprintId)
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

    // 5. Get estimated cost (use first variant price)
    let estimatedCost = 950 // Default fallback
    if (firstVariant.price && typeof firstVariant.price === 'number') {
      estimatedCost = firstVariant.price
    } else {
      const costKey = `${blueprintId}-${providerId}`
      estimatedCost = ESTIMATED_COSTS[costKey] || 950
    }

    // 6. Get shipping cost to Netherlands
    const shippingCost = await getShippingCost(blueprintId, providerId, COUNTRY_CODE)

    return {
      blueprintId,
      providerId,
      title: blueprint.title,
      brand: blueprint.brand,
      model: blueprint.model,
      providerName: providerInfo?.title || `Provider ${providerId}`,
      estimatedCost,
      shippingCost,
      totalCost: estimatedCost + shippingCost,
      printAreas,
      images: blueprint.images || [],
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

    // Test each blueprint and find the best provider
    for (const blueprintId of FRONT_BACK_BLUEPRINT_IDS) {
      console.log(`\nTesting blueprint ${blueprintId}...`)

      try {
        // 1. Fetch blueprint data
        const blueprintResponse = await fetch(
          `https://api.printify.com/v1/catalog/blueprints/${blueprintId}.json`,
          { headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` } }
        )

        if (!blueprintResponse.ok) {
          console.log(`  ✗ Blueprint ${blueprintId} not found`)
          continue
        }

        const blueprintData = await blueprintResponse.json()
        console.log(`  Blueprint: ${blueprintData.title}`)

        // 2. Get available providers
        const providers = await getAvailableProviders(blueprintId)
        if (providers.length === 0) {
          console.log(`  ✗ No providers available for blueprint ${blueprintId}`)
          continue
        }

        console.log(`  Available providers: ${providers.map((p: any) => `${p.title} (${p.id})`).join(', ')}`)

        // 3. Check if preferred provider is available
        const preferredProvider = providers.find((p: any) => p.id === PREFERRED_PROVIDER_ID)
        let selectedProviderId: number

        if (preferredProvider) {
          console.log(`  ✓ Preferred provider ${PREFERRED_PROVIDER_ID} (${preferredProvider.title}) is available`)
          selectedProviderId = PREFERRED_PROVIDER_ID
        } else {
          console.log(`  ✗ Preferred provider ${PREFERRED_PROVIDER_ID} not available`)
          const cheapestProviderId = await findCheapestProvider(blueprintId, providers)
          if (!cheapestProviderId) {
            console.log(`  ✗ Could not find a suitable provider`)
            continue
          }
          selectedProviderId = cheapestProviderId
        }

        // 4. Test the selected provider
        const result = await testBlueprintProvider(blueprintId, selectedProviderId, blueprintData)

        if (result) {
          allCombinations.push(result)
          console.log(`  ✓ Success! ${result.providerName}: $${(result.totalCost / 100).toFixed(2)} (product: $${(result.estimatedCost / 100).toFixed(2)} + shipping: $${(result.shippingCost / 100).toFixed(2)})`)
        } else {
          console.log(`  ✗ Blueprint ${blueprintId} with provider ${selectedProviderId} failed validation (missing front/back print areas)`)
        }

        // Rate limiting - be nice to the API
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`  ✗ Error processing blueprint ${blueprintId}:`, error)
      }
    }

    console.log(`\nFound ${allCombinations.length} valid blueprint/provider combinations`)

    if (allCombinations.length === 0) {
      console.error('❌ No valid blueprints found!')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No valid blueprints with front/back printing found',
          blueprints: [],
          country: COUNTRY_CODE,
          total_tested: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Sort by total cost and get up to 4
    const cheapest = allCombinations
      .filter(c => c.totalCost > 0)
      .sort((a, b) => a.totalCost - b.totalCost)
      .slice(0, 4)

    console.log(`\n🏆 Top ${cheapest.length} Cheapest Options for Netherlands:`)
    cheapest.forEach((c, idx) => {
      console.log(
        `${idx + 1}. ${c.title} via ${c.providerName}: $${(c.totalCost / 100).toFixed(2)}`
      )
    })

    // Transform to the expected format
    const blueprints = cheapest.map(c => ({
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

      const cacheEntries = cheapest.map((c, index) => ({
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
