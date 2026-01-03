import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"

const PRINTIFY_API_TOKEN = Deno.env.get('PRINTIFY_API_TOKEN')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Blueprint IDs that support front/back printing (validated via API)
const FRONT_BACK_BLUEPRINT_IDS = [5, 6, 9, 12, 36, 41]

// Default print provider (Printify Choice)
const DEFAULT_PRINT_PROVIDER_ID = 99

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

        // Get variants with placeholders to find print areas
        const variantsResponse = await fetch(
          `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${DEFAULT_PRINT_PROVIDER_ID}/variants.json`,
          {
            headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` },
          }
        )

        let printAreas: { position: string; width: number; height: number }[] = []
        
        if (variantsResponse.ok) {
          const variantsData = await variantsResponse.json()
          const firstVariant = variantsData.variants?.[0]
          
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

        blueprints.push({
          id: blueprintData.id,
          title: blueprintData.title,
          description: blueprintData.description,
          brand: blueprintData.brand,
          model: blueprintData.model,
          images: blueprintData.images || [],
          printAreas,
        })

        console.log(`Fetched blueprint ${blueprintId}: ${blueprintData.title}`)
      } catch (err) {
        console.error(`Error fetching blueprint ${blueprintId}:`, err)
      }
    }

    console.log(`Found ${blueprints.length} blueprints with front/back support`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        blueprints,
        printProviderId: DEFAULT_PRINT_PROVIDER_ID,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching catalog blueprints:', error)
    return handleError(error, corsHeaders)
  }
})
