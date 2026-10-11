import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"
import { requireUser } from "../_shared/authGuard.ts"
import { corsHeadersFor } from '../_shared/cors.ts'
import { fetchPrintify } from "../_shared/fetchWithTimeout.ts"
import "../_shared/sentry.ts";

// Environment variables will be validated when needed

// SSRF hardening: only allow forwarding image URLs from trusted hosts to Printify
function isAllowedImageUrl(u: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(u)
  } catch {
    return false
  }

  if (parsed.protocol !== 'https:') {
    return false
  }

  const host = parsed.hostname.toLowerCase()
  return (
    host.endsWith('.supabase.co') ||
    host === 'images.printify.com' ||
    host === 'images-api.printify.com' ||
    host.endsWith('.amazonaws.com')
  )
}

// ~15 MB of image data once decoded.
const MAX_IMAGE_BASE64_LENGTH = 20 * 1024 * 1024
const MAX_IMAGE_URL_LENGTH = 2048
const SAFE_FILE_NAME = /^[A-Za-z0-9._-]{1,100}\.(png|jpe?g|webp)$/i

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req)
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const auth = await requireUser(req.headers.get('authorization'))

    const {
      image_url,      // URL of the image to upload
      image_base64,   // OR base64 encoded image
      file_name = 'design.png',
    } = await req.json()

    if (image_url && (typeof image_url !== 'string' || image_url.length > MAX_IMAGE_URL_LENGTH || !isAllowedImageUrl(image_url))) {
      throw new FunctionError(400, "INVALID_IMAGE_URL", "image_url host not allowed")
    }
    if (image_base64 !== undefined && (typeof image_base64 !== 'string' || image_base64.length > MAX_IMAGE_BASE64_LENGTH)) {
      throw new FunctionError(413, "IMAGE_TOO_LARGE", "image_base64 exceeds the upload limit")
    }
    // Printify shows the name in the merchant dashboard; never pass arbitrary input through.
    const safeFileName = typeof file_name === 'string' && SAFE_FILE_NAME.test(file_name) ? file_name : 'design.png'

    console.log('=== UPLOAD PRINTIFY IMAGE ===')
    console.log('Image URL:', image_url)
    console.log('Has base64:', !!image_base64)
    console.log('File name:', safeFileName)

    // Validate environment variables and request data
    const PRINTIFY_API_TOKEN = validateEnvVars.printifyToken()
    validateRequest.imageUpload(image_url, image_base64)

    let uploadPayload: any = {
      file_name: safeFileName,
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

    // Image uploads can take longer, use 30 second timeout
    const response = await fetchPrintify(
      '/v1/uploads/images.json',
      PRINTIFY_API_TOKEN,
      {
        method: 'POST',
        body: JSON.stringify(uploadPayload),
      },
      30_000 // 30 second timeout for image uploads
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
