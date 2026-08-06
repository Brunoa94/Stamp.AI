import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"
import { calculatePlacement, isScaleOnlyBlueprint, getBlueprintAnchorY } from "../_shared/printPlacement.ts"
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
      // Per-position placements chosen by the user (optional). Positions
      // without an entry fall back to auto-placement.
      placements: userPlacements,
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

    // Resolve position -> image id map. Supports the position-keyed
    // print_areas object and the legacy single image_id (front only).
    // Positions the product doesn't offer are dropped.
    console.log('🖼️ Received print_areas:', JSON.stringify(print_areas))
    console.log('🖼️ Received image_id:', image_id)

    const requestedAreas: Record<string, string> = {}
    if (print_areas && typeof print_areas === 'object') {
      for (const [position, imageId] of Object.entries(print_areas)) {
        console.log(`  Processing position "${position}" with imageId: ${imageId}`)
        if (!imageId || typeof imageId !== 'string') {
          console.warn(`  ⚠️ Skipping "${position}": invalid imageId`)
          continue
        }
        if (!availablePrintAreas.includes(position)) {
          console.warn(`  ⚠️ Position "${position}" not offered by blueprint; skipping`)
          continue
        }
        requestedAreas[position] = imageId
      }
    } else if (image_id) {
      requestedAreas[primaryPrintArea] = image_id
    }

    console.log('🎯 Final requestedAreas:', JSON.stringify(requestedAreas))

    if (Object.keys(requestedAreas).length === 0) {
      console.error('❌ IMAGE_REQUIRED: No valid print areas found')
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

    // === PLACEMENT RESOLUTION ===
    // For each requested position: use the user's placement when provided,
    // otherwise auto-calculate from the image and print-area dimensions.
    const isValidPlacement = (p: any): boolean =>
      p && typeof p === 'object' &&
      typeof p.x === 'number' && p.x >= 0 && p.x <= 1 &&
      typeof p.y === 'number' && p.y >= 0 && p.y <= 1 &&
      typeof p.scale === 'number' && p.scale > 0 && p.scale <= 2 &&
      typeof p.angle === 'number'

    const artworkWidth = image_width && image_width > 0 ? image_width : 3000
    const artworkHeight = image_height && image_height > 0 ? image_height : 3000
    if (!(image_width && image_height)) {
      console.log('⚠️ No image dimensions provided, assuming 3000x3000 for auto-placement')
    }

    const resolvePlacement = (position: string) => {
      const userPlacement = userPlacements?.[position]

      // For scaleOnly blueprints (like AOP Tote Bag), force centered placement
      // Only accept the scale value from user, ignore x/y/angle
      if (isScaleOnlyBlueprint(finalBlueprintId)) {
        const userScale = isValidPlacement(userPlacement) ? userPlacement.scale : 1

        // For AOP Tote Bag (blueprint 1389), the print area is 2175x4350 (front+back)
        // The front panel is the TOP HALF of the print area (0 to 0.5 in y coordinates)
        // We need to center the image within the front panel, accounting for image height
        const placeholder = firstVariantPlaceholders.find((p: any) => p.position === position)
        const paWidth = placeholder?.width || printAreaWidth
        const paHeight = placeholder?.height || printAreaHeight

        // Calculate image height in normalized coordinates
        // scale = image width / print area width
        // imageHeightNorm = (imageHeight / imageWidth) * scale * (paWidth / paHeight)
        const imageAspect = artworkWidth / artworkHeight
        const printAreaAspect = paWidth / paHeight
        const imageHeightNorm = (userScale / imageAspect) * printAreaAspect

        // For front+back tote (1389), front panel is y: 0 to 0.5
        // Center of front panel is 0.25, but we need to account for image height
        // y position is the CENTER of the image, so:
        // y = frontPanelCenter = 0.25 (center of top half)
        // But adjust slightly down to account for handle area at top
        const frontPanelCenter = 0.27  // Slightly below center to avoid handles
        const y = frontPanelCenter

        console.log(`🔒 ScaleOnly blueprint ${finalBlueprintId}: x=0.5, y=${y.toFixed(3)}, scale=${userScale}, imageHeightNorm=${imageHeightNorm.toFixed(3)}`)
        return { x: 0.5, y, scale: userScale, angle: 0 }
      }

      if (isValidPlacement(userPlacement)) {
        console.log(`🎯 Using user placement for "${position}"`)
        return userPlacement
      }
      const placeholder = firstVariantPlaceholders.find((p: any) => p.position === position)
      return calculatePlacement(
        artworkWidth,
        artworkHeight,
        placeholder?.width || printAreaWidth,
        placeholder?.height || printAreaHeight,
        finalBlueprintId,
        position
      )
    }

    // Track the primary placement for the debug field in the response
    let primaryPlacement = { x: 0.5, y: 0.5, scale: 1, angle: 0 }

    // Build placeholders, one per requested position
    const placeholders = []
    for (const [position, imageId] of Object.entries(requestedAreas)) {
      const placement = resolvePlacement(position)
      if (position === primaryPrintArea || placeholders.length === 0) {
        primaryPlacement = placement
      }
      console.log(`🎯 Placement for "${position}": x=${placement.x.toFixed(3)}, y=${placement.y.toFixed(3)}, scale=${placement.scale.toFixed(3)}, angle=${placement.angle}`)
      placeholders.push({
        position,
        images: [{
          id: imageId,
          x: placement.x,
          y: placement.y,
          scale: placement.scale,
          angle: placement.angle,
        }],
      })
    }

    // Include scale in title for debugging placement issues
    const scaleInfo = `[scale:${primaryPlacement.scale.toFixed(2)}, y:${primaryPlacement.y.toFixed(2)}]`
    const productTitle = title ? `${title} ${scaleInfo}` : `Custom Design ${Date.now()} ${scaleInfo}`

    const productPayload = {
      title: productTitle,
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
