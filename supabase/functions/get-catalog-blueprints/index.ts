import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"

const PRINTIFY_API_TOKEN = Deno.env.get('PRINTIFY_API_TOKEN')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Blueprint IDs that support front/back printing (validated via API)
const FRONT_BACK_BLUEPRINT_IDS = [49, 145, 157, 553]

// Preferred print provider (will fallback to first available if not found)
const PREFERRED_PRINT_PROVIDER_ID = 99

interface BlueprintInfo {
  id: number
  title: string
  description: string
  brand: string
  model: string
  images: string[]
  printAreas: {
    position: string
    width: number
    height: number
  }[]
  min_price: number
  print_provider_id?: number
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    console.log('=== GET CATALOG BLUEPRINTS ===')

    if (!PRINTIFY_API_TOKEN) {
      throw ErrorCodes.PRINTIFY_TOKEN_MISSING()
    }

    const blueprints: BlueprintInfo[] = []

    // Fetch details for each blueprint that supports front/back
    for (const blueprintId of FRONT_BACK_BLUEPRINT_IDS) {
      try {
        // Get blueprint info
        const blueprintResponse = await fetch(
          `https://api.printify.com/v1/catalog/blueprints/${blueprintId}.json`,
          {
            headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` },
          }
        )
        
        if (!blueprintResponse.ok) {
          console.log(`Blueprint ${blueprintId} not found, skipping`)
          continue
        }

        const blueprintData = await blueprintResponse.json()
        console.log(`  Blueprint: ${blueprintData.title}`)

        // Get available providers
        const providers = await getAvailableProviders(blueprintId)
        if (providers.length === 0) {
          console.log(`  No providers available, skipping`)
          continue
        }

        // Check if preferred provider is available, otherwise use first available
        const preferredProvider = providers.find((p: any) => p.id === PREFERRED_PRINT_PROVIDER_ID)
        const selectedProviderId = preferredProvider
          ? PREFERRED_PRINT_PROVIDER_ID
          : providers[0].id

        if (!preferredProvider) {
          console.log(`  Preferred provider ${PREFERRED_PRINT_PROVIDER_ID} not available, using ${providers[0].title} (${providers[0].id})`)
        }

        // Get variants with placeholders to find print areas
        const variantsResponse = await fetch(
          `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${selectedProviderId}/variants.json`,
          {
            headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` },
          }
        )

        let printAreas: { position: string; width: number; height: number }[] = []
        let minPrice = 0

        if (variantsResponse.ok) {
          const variantsData = await variantsResponse.json()
          const firstVariant = variantsData.variants?.[0]

          // Calculate minimum price across all variants
          let tempMinPrice = Infinity
          if (variantsData.variants && Array.isArray(variantsData.variants)) {
            variantsData.variants.forEach((variant: any) => {
              if (variant.price && typeof variant.price === 'number') {
                tempMinPrice = Math.min(tempMinPrice, variant.price)
              }
            })
          }

          // If no valid price found, set to 0
          if (tempMinPrice !== Infinity) {
            minPrice = tempMinPrice
          }

          if (firstVariant?.placeholders) {
            printAreas = firstVariant.placeholders
              .filter((p: any) => p.position === 'front' || p.position === 'back')
              .map((p: any) => ({
                position: p.position,
                width: p.width,
                height: p.height,
              }))
          }
        }

        // Check if blueprint has both front and back print areas
        const hasFront = printAreas.some(p => p.position === 'front')
        const hasBack = printAreas.some(p => p.position === 'back')

        if (!hasFront || !hasBack) {
          console.log(`  Skipping - missing front/back print areas`)
          continue
        }

        blueprints.push({
          id: blueprintData.id,
          title: blueprintData.title,
          description: blueprintData.description,
          brand: blueprintData.brand,
          model: blueprintData.model,
          images: blueprintData.images || [],
          printAreas,
          min_price: minPrice,
          print_provider_id: selectedProviderId,
        })

        console.log(`  ✓ Success with provider ${selectedProviderId}`)
      } catch (err) {
        console.error(`Error fetching blueprint ${blueprintId}:`, err)
      }
    }

    console.log(`Found ${blueprints.length} blueprints with front/back support`)

    // Sort blueprints by minimum price (ascending) and take top 4
    const sortedBlueprints = blueprints
      .filter(bp => bp.min_price > 0) // Exclude blueprints without valid pricing
      .sort((a, b) => a.min_price - b.min_price)
      .slice(0, 4)

    console.log(`Returning ${sortedBlueprints.length} cheapest blueprints`)
    sortedBlueprints.forEach(bp => {
      console.log(`  - ${bp.title}: $${(bp.min_price / 100).toFixed(2)}`)
    })

    if (sortedBlueprints.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No valid blueprints with front/back printing found',
          blueprints: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        blueprints: sortedBlueprints,
        // Note: Each blueprint may use a different print provider (see blueprint.print_provider_id)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching catalog blueprints:', error)
    return handleError(error, corsHeaders)
  }
})
