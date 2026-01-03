import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"

const PRINTIFY_API_TOKEN = Deno.env.get('PRINTIFY_API_TOKEN')
const PRINTIFY_SHOP_ID = Deno.env.get('PRINTIFY_SHOP_ID')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { 
      blueprint_id,      // Printify catalog blueprint ID (e.g., 6 for Bella+Canvas 3001)
      print_provider_id, // Print provider ID
      image_id,          // Uploaded image ID for front (legacy support)
      print_areas,       // Object with front/back image IDs: { front?: string, back?: string }
      title,             // Product title
      description,       // Product description
      variants,          // Array of variant IDs to enable
    } = await req.json()

    console.log('=== CREATE CUSTOM PRODUCT ===')
    console.log('Blueprint ID:', blueprint_id)
    console.log('Print Provider ID:', print_provider_id)
    console.log('Image ID (legacy):', image_id)
    console.log('Print Areas:', JSON.stringify(print_areas))

    if (!PRINTIFY_API_TOKEN) {
      throw ErrorCodes.PRINTIFY_TOKEN_MISSING()
    }

    if (!PRINTIFY_SHOP_ID) {
      throw ErrorCodes.PRINTIFY_SHOP_ID_MISSING()
    }

    // Support both legacy image_id and new print_areas format
    const frontImageId = print_areas?.front || image_id
    const backImageId = print_areas?.back

    if (!blueprint_id) {
      throw ErrorCodes.BLUEPRINT_ID_REQUIRED()
    }

    if (!print_provider_id) {
      throw ErrorCodes.PRINT_PROVIDER_ID_REQUIRED()
    }

    if (!frontImageId && !backImageId) {
      throw ErrorCodes.IMAGE_REQUIRED()
    }

    const finalBlueprintId = blueprint_id
    const finalPrintProviderId = print_provider_id

    console.log('Using Blueprint:', finalBlueprintId)
    console.log('Using Print Provider:', finalPrintProviderId)

    // Get print provider variants
    console.log('Fetching print provider variants...')
    const variantsResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${finalBlueprintId}/print_providers/${finalPrintProviderId}/variants.json`,
      {
        headers: { 'Authorization': `Bearer ${PRINTIFY_API_TOKEN}` },
      }
    )
    const variantsData = await variantsResponse.json()
    console.log('Variants count:', variantsData.variants?.length || 0)
    
    // Get all available variants
    const availableVariants = variantsData.variants || []
    
    if (availableVariants.length === 0) {
      throw ErrorCodes.NO_VARIANTS_AVAILABLE()
    }
    
    // Enable a good selection of variants - up to 100 to cover most sizes/colors
    // If user provides specific variants, use those
    const selectedVariants = variants && variants.length > 0
      ? variants
      : availableVariants.slice(0, 100).map((v: any) => v.id)

    console.log('Selected variants count:', selectedVariants.length)

    // Build placeholders array based on provided images
    const placeholders: Array<{
      position: string;
      images: Array<{ id: string; x: number; y: number; scale: number; angle: number }>;
    }> = []

    if (frontImageId) {
      console.log('Adding front print area with image:', frontImageId)
      placeholders.push({
        position: 'front',
        images: [
          {
            id: frontImageId,
            x: 0.5,
            y: 0.5,
            scale: 1,
            angle: 0,
          }
        ]
      })
    }

    if (backImageId) {
      console.log('Adding back print area with image:', backImageId)
      placeholders.push({
        position: 'back',
        images: [
          {
            id: backImageId,
            x: 0.5,
            y: 0.5,
            scale: 1,
            angle: 0,
          }
        ]
      })
    }

    console.log('Total placeholders:', placeholders.length)

    // Build the product payload
    const productPayload = {
      title: title || `Custom Design ${Date.now()}`,
      description: description || 'Custom designed product',
      blueprint_id: finalBlueprintId,
      print_provider_id: finalPrintProviderId,
      variants: selectedVariants.map((variantId: number) => ({
        id: variantId,
        price: 2500, // $25.00 in cents
        is_enabled: true,
      })),
      print_areas: [
        {
          variant_ids: selectedVariants,
          placeholders: placeholders,
        }
      ],
    }

    console.log('Creating product with payload:', JSON.stringify(productPayload, null, 2))

    // Create the product
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

    // Return the created product details
    return new Response(
      JSON.stringify({ 
        success: true, 
        product: {
          id: productData.id,
          title: productData.title,
          variants: productData.variants?.map((v: any) => ({
            id: v.id,
            title: v.title,
            price: v.price,
            is_enabled: v.is_enabled,
          })),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating custom product:', error)
    return handleError(error, corsHeaders)
  }
})
