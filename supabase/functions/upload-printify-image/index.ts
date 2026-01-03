import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"

// Environment variables will be validated when needed

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
      image_url,      // URL of the image to upload
      image_base64,   // OR base64 encoded image
      file_name = 'design.png',
    } = await req.json()

    console.log('=== UPLOAD PRINTIFY IMAGE ===')
    console.log('Image URL:', image_url)
    console.log('Has base64:', !!image_base64)
    console.log('File name:', file_name)

    // Validate environment variables and request data
    const PRINTIFY_API_TOKEN = validateEnvVars.printifyToken()
    validateRequest.imageUpload(image_url, image_base64)

    let uploadPayload: any = {
      file_name: file_name,
    }

    if (image_url) {
      // Upload via URL
      uploadPayload.url = image_url
    } else if (image_base64) {
      // Upload via base64
      // Remove data URL prefix if present
      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '')
      uploadPayload.contents = base64Data
    }

    console.log('Uploading image to Printify...')

    const response = await fetch(
      'https://api.printify.com/v1/uploads/images.json',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadPayload),
      }
    )

    const data = await response.json()

    console.log('Printify upload response status:', response.status)
    console.log('Printify upload response:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      throw ErrorCodes.IMAGE_UPLOAD_API_ERROR(JSON.stringify(data))
    }

    console.log('✅ Image uploaded successfully:', data.id)

    // Return the image details needed for creating orders
    return new Response(
      JSON.stringify({ 
        success: true, 
        image: {
          id: data.id,
          file_name: data.file_name,
          height: data.height,
          width: data.width,
          size: data.size,
          mime_type: data.mime_type,
          preview_url: data.preview_url,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error uploading image:', error)
    return handleError(error, corsHeaders)
  }
})
