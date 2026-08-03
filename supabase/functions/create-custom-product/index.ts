import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"
import { calculatePlacement } from "../_shared/printPlacement.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

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
      // Image dimensions for placement calculation (optional, from upload response)
      image_width,
      image_height,
      // Order-related fields from client
      user_id,
      customer_email
    } = await req.json()

    console.log('=== CREATE CUSTOM PRODUCT ===')
    console.log('🎨 Selected color:', selected_color)
    console.log('📏 Selected size:', selected_size)
    console.log('🖼️ Received image dimensions:', image_width, 'x', image_height)

    // Validate environment variables
    const PRINTIFY_API_TOKEN = validateEnvVars.printifyToken()
    const PRINTIFY_SHOP_ID = validateEnvVars.printifyShopId()

    const validBlueprintId = validateRequest.blueprintId(blueprint_id)
    const validPrintProviderId = validateRequest.printProviderId(print_provider_id)

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

    // Get print area dimensions from first variant's placeholders
    const firstVariantPlaceholders = availableVariants[0]?.placeholders || []
    const availablePrintAreas = firstVariantPlaceholders.map((p: any) => p.position) || ['front']
    console.log('📍 Available print areas:', availablePrintAreas.join(', '))

    // Find print area dimensions for front position
    const frontPlaceholder = firstVariantPlaceholders.find((p: any) => p.position === 'front')
    const printAreaWidth = frontPlaceholder?.width || 3500
    const printAreaHeight = frontPlaceholder?.height || 4000
    console.log(`📐 Print area dimensions: ${printAreaWidth}x${printAreaHeight}px`)

    // Prioritize "front" for primary print area (some products list "neck" first)
    const primaryPrintArea = availablePrintAreas.includes('front') ? 'front' : availablePrintAreas[0] || 'front'
    const secondaryPrintArea = availablePrintAreas.includes('back') ? 'back' : null

    // Get image IDs - support both explicit print_areas and legacy image_id
    let primaryImageId: string | undefined
    let secondaryImageId: string | undefined

    if (print_areas) {
      for (const area of availablePrintAreas) {
        if (print_areas[area] && !primaryImageId) {
          primaryImageId = print_areas[area]
        } else if (print_areas[area] && !secondaryImageId) {
          secondaryImageId = print_areas[area]
        }
      }
      if (!primaryImageId && print_areas.front) {
        primaryImageId = print_areas.front
      }
      if (!secondaryImageId && print_areas.back) {
        secondaryImageId = print_areas.back
      }
    } else if (image_id) {
      primaryImageId = image_id
    }

    if (!primaryImageId && !secondaryImageId) {
      throw ErrorCodes.IMAGE_REQUIRED()
    }

    // Filter variants by selected color and size if provided
    let selectedVariants: number[] = []

    if (variants && variants.length > 0) {
      selectedVariants = variants
    } else if (selected_color || selected_size) {
      console.log(`🎨 Filtering variants by color: "${selected_color}", size: "${selected_size}"`)

      const matchingVariants = availableVariants.filter((v: any) => {
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
        console.warn(`⚠️ No variants match color: "${selected_color}", size: "${selected_size}". Using defaults.`)
        selectedVariants = availableVariants.slice(0, 100).map((v: any) => v.id)
      }
    } else {
      selectedVariants = availableVariants.slice(0, 100).map((v: any) => v.id)
    }

    // === AUTO-PLACEMENT CALCULATION ===
    // If image dimensions are provided, calculate optimal placement
    // Otherwise, fall back to default centered placement
    let primaryPlacement = { x: 0.5, y: 0.5, scale: 1, angle: 0 }

    if (image_width && image_height && image_width > 0 && image_height > 0) {
      console.log(`🖼️ Image dimensions: ${image_width}x${image_height}px`)
      primaryPlacement = calculatePlacement(
        image_width,
        image_height,
        printAreaWidth,
        printAreaHeight,
        finalBlueprintId,
        primaryPrintArea
      )
    } else {
      // Default fallback: calculate for a typical square image (1:1 aspect ratio)
      console.log('⚠️ No image dimensions provided, using optimized default placement')
      primaryPlacement = calculatePlacement(
        3000, // Assume reasonable resolution
        3000,
        printAreaWidth,
        printAreaHeight,
        finalBlueprintId,
        primaryPrintArea
      )
    }

    console.log(`🎯 Final placement: x=${primaryPlacement.x.toFixed(3)}, y=${primaryPlacement.y.toFixed(3)}, scale=${primaryPlacement.scale.toFixed(3)}`)

    // Build placeholders with auto-corrected placement
    const placeholders = []

    if (primaryImageId) {
      placeholders.push({
        position: primaryPrintArea,
        images: [{
          id: primaryImageId,
          x: primaryPlacement.x,
          y: primaryPlacement.y,
          scale: primaryPlacement.scale,
          angle: primaryPlacement.angle,
        }],
      })
    }

    if (secondaryImageId && secondaryPrintArea) {
      // Use same placement for back
      placeholders.push({
        position: secondaryPrintArea,
        images: [{
          id: secondaryImageId,
          x: primaryPlacement.x,
          y: primaryPlacement.y,
          scale: primaryPlacement.scale,
          angle: primaryPlacement.angle,
        }],
      })
    }

    const productPayload = {
      title: title || `Custom Design ${Date.now()}`,
      description: description || 'Custom designed product',
      blueprint_id: finalBlueprintId,
      print_provider_id: finalPrintProviderId,
      variants: selectedVariants.map((variantId: number) => ({
        id: variantId,
        price: 50,
        is_enabled: true,
      })),
      print_areas: [
        {
          variant_ids: selectedVariants,
          placeholders,
        }
      ],
    }

    // Create Printify product
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

    // Transform image URLs to use front camera view
    const transformedImages = productData.images?.map((img: any) => {
      let src = img.src
      if (src && src.includes('camera_label=')) {
        src = src.replace(/camera_label=[^&]+/, 'camera_label=front')
      } else if (src && src.includes('?')) {
        src = src + '&camera_label=front'
      } else if (src) {
        src = src + '?camera_label=front'
      }
      return {
        src,
        variant_ids: img.variant_ids,
        position: img.position,
        is_default: img.is_default,
      }
    }) || []

    return new Response(
      JSON.stringify({
        success: true,
        product: {
          id: productData.id,
          title: productData.title,
          description: productData.description,
          images: transformedImages,
          variants: productData.variants?.map((v: any) => ({
            id: v.id,
            title: v.title,
            price: v.price,
            is_enabled: v.is_enabled,
          })),
        },
        // Include placement info for debugging
        placement: primaryPlacement,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating custom product:', error)
    return handleError(error, corsHeaders)
  }
})
