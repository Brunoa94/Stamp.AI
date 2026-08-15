import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"

// Environment variables will be validated when needed

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Default print provider (Printify Choice)
const DEFAULT_PRINT_PROVIDER_ID = 99

interface VariantInfo {
  id: number
  title: string
  options: {
    color?: string
    size?: string
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { blueprint_id, print_provider_id } = await req.json()
    
    console.log('=== GET BLUEPRINT VARIANTS ===')
    console.log('Blueprint ID:', blueprint_id)

    // Validate environment variables and request data
    const PRINTIFY_API_TOKEN = validateEnvVars.printifyToken()
    const validBlueprintId = validateRequest.blueprintId(blueprint_id)

    const providerId = print_provider_id || DEFAULT_PRINT_PROVIDER_ID

    // Fetch variants for the blueprint
    const variantsResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${validBlueprintId}/print_providers/${providerId}/variants.json`,
      {
        headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` },
      }
    )

    if (!variantsResponse.ok) {
      const errorData = await variantsResponse.json()
      throw ErrorCodes.PRINTIFY_API_ERROR(JSON.stringify(errorData))
    }

    const variantsData = await variantsResponse.json()
    
    // Parse variants to extract colors and sizes
    const variants: VariantInfo[] = variantsData.variants?.map((v: any) => ({
      id: v.id,
      title: v.title,
      options: v.options || {},
    })) || []

    // Extract unique colors and sizes
    const colorsMap = new Map<string, number[]>() // color -> variant IDs
    const sizesSet = new Set<string>()

    // Known size patterns to detect when a "color" is actually a size
    // Matches: S, M, L, XL, 11oz, 15oz, 10", 12x12, 14" × 14", ONE SIZE, etc.
    const sizePatterns = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL|5XL|ONE SIZE|\d+(?:\.\d+)?\s*(?:oz|ml|inch|cm|"|')?\s*[×x]?\s*\d*(?:\.\d+)?\s*(?:oz|ml|inch|cm|"|')?)$/i

    variants.forEach((v) => {
      // Try to get color and size from options first (most reliable)
      let color = v.options.color
      let size = v.options.size

      // Fallback to parsing title if options are missing
      if (!color && !size && v.title) {
        const titleParts = v.title.split(' / ').map((p: string) => p.trim())

        if (titleParts.length === 2) {
          // Standard format: "Color / Size"
          color = titleParts[0]
          size = titleParts[1]
        } else if (titleParts.length === 1) {
          // Single value - determine if it's a size or color
          const singleValue = titleParts[0]
          if (sizePatterns.test(singleValue)) {
            // It's a size (e.g., "M", "L", "XL", "ONE SIZE")
            size = singleValue
            // For products with only sizes (like white socks), don't set color from title
          } else {
            // It's a color
            color = singleValue
          }
        }
      }

      // Additional check: if parsed "color" looks like a size, treat it as size
      if (color && sizePatterns.test(color) && !size) {
        size = color
        color = undefined
      }

      if (color) {
        if (!colorsMap.has(color)) {
          colorsMap.set(color, [])
        }
        colorsMap.get(color)!.push(v.id)
      }
      if (size) {
        sizesSet.add(size)
      }
    })

    const colors = Array.from(colorsMap.keys())
    const sizes = Array.from(sizesSet)

    console.log(`Parsed colors: [${colors.join(', ')}]`)
    console.log(`Parsed sizes: [${sizes.join(', ')}]`)

    console.log(`Found ${variants.length} variants, ${colors.length} colors, ${sizes.length} sizes`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        variants,
        colors,
        sizes,
        printProviderId: providerId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching blueprint variants:', error)
    return handleError(error, corsHeaders)
  }
})
