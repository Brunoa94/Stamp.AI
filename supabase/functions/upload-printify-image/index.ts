import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ErrorCodes, FunctionError, handleError } from "../_shared/errors.ts"
import { validateEnvVars, validateRequest } from "../_shared/validators.ts"
import { requireUser } from "../_shared/authGuard.ts"
import { corsHeadersFor } from '../_shared/cors.ts'

// Environment variables will be validated when needed

// Printify's own S3 bucket for uploaded/mockup images (keep in sync with
// next.config.ts remotePatterns and /api/fetch-remote-image).
const PRINTIFY_S3_HOST = 'pfy-prod-image-storage.s3.us-east-2.amazonaws.com'

// ~20MB decoded (base64 inflates by 4/3). Printify's own limit is lower, so
// this only bounds memory / bandwidth on our side.
const MAX_IMAGE_BASE64_CHARS = 28 * 1024 * 1024
// The JSON envelope around image_base64 is tiny; anything bigger is rejected
// before the body is parsed.
const MAX_REQUEST_BYTES = MAX_IMAGE_BASE64_CHARS + 16 * 1024

const MAX_FILE_NAME_LENGTH = 100
const SAFE_FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const DEFAULT_FILE_NAME = 'design.png'

const PRINTIFY_FETCH_TIMEOUT_MS = 30_000

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
    host === PRINTIFY_S3_HOST
  )
}

/**
 * Accept only a plain basename made of safe characters. Path separators,
 * leading dots, control characters and overly long names are rejected.
 */
function validateFileName(raw: unknown): string {
  if (raw === undefined || raw === null) {
    return DEFAULT_FILE_NAME
  }
  if (typeof raw !== 'string') {
    throw new FunctionError(400, 'INVALID_FILE_NAME', 'file_name must be a string')
  }
  const name = raw.trim()
  if (
    name.length === 0 ||
    name.length > MAX_FILE_NAME_LENGTH ||
    name.includes('/') ||
    name.includes('\\') ||
    !SAFE_FILE_NAME.test(name)
  ) {
    throw new FunctionError(400, 'INVALID_FILE_NAME', 'file_name contains unsupported characters')
  }
  return name
}

function validateBase64Image(raw: unknown): string {
  if (typeof raw !== 'string') {
    throw new FunctionError(400, 'INVALID_IMAGE_BASE64', 'image_base64 must be a string')
  }
  if (raw.length > MAX_IMAGE_BASE64_CHARS) {
    throw new FunctionError(413, 'IMAGE_TOO_LARGE', 'image_base64 exceeds the maximum size')
  }
  // Remove data URL prefix if present
  const base64Data = raw.replace(/^data:image\/[\w.+-]+;base64,/, '')
  if (base64Data.length === 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64Data)) {
    throw new FunctionError(400, 'INVALID_IMAGE_BASE64', 'image_base64 is not valid base64')
  }
  return base64Data
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req)
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const auth = await requireUser(req.headers.get('authorization'))

    const contentLength = Number(req.headers.get('content-length'))
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      throw new FunctionError(413, 'IMAGE_TOO_LARGE', 'Request body exceeds the maximum size')
    }

    const {
      image_url,      // URL of the image to upload
      image_base64,   // OR base64 encoded image
      file_name,
    } = await req.json()

    if (image_url !== undefined && image_url !== null) {
      if (typeof image_url !== 'string' || !isAllowedImageUrl(image_url)) {
        throw new FunctionError(400, "INVALID_IMAGE_URL", "image_url host not allowed")
      }
    }

    const safeFileName = validateFileName(file_name)

    console.log('=== UPLOAD PRINTIFY IMAGE ===')
    console.log('User:', auth.userId)
    console.log('Source:', image_url ? `url:${new URL(image_url).hostname}` : 'base64')

    // Validate environment variables and request data
    const PRINTIFY_API_TOKEN = validateEnvVars.printifyToken()
    validateRequest.imageUpload(image_url, image_base64)

    const uploadPayload: { file_name: string; url?: string; contents?: string } = {
      file_name: safeFileName,
    }

    if (image_url) {
      // Upload via URL
      uploadPayload.url = image_url
    } else {
      // Upload via base64
      uploadPayload.contents = validateBase64Image(image_base64)
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
        signal: AbortSignal.timeout(PRINTIFY_FETCH_TIMEOUT_MS),
      }
    )

    const data = await response.json()

    // Log only what is needed for tracing; never the full response body.
    console.log('Printify upload response status:', response.status, 'id:', data?.id ?? null)

    if (!response.ok) {
      throw ErrorCodes.IMAGE_UPLOAD_API_ERROR(`status ${response.status}`)
    }

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
    console.error('Error uploading image:', error instanceof Error ? `${error.name}: ${error.message}` : error)
    return handleError(error, corsHeaders)
  }
})
