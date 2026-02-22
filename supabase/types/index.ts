// Shared types for both Supabase functions and frontend

// Export success types
export * from './success'

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponseI<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiErrorI {
  status: number
  message: string
}

// =============================================================================
// Authentication Types
// =============================================================================

export interface UserI {
  id: string
  email: string
  email_confirmed_at?: string | null
  last_sign_in_at?: string | null
  created_at: string
  updated_at?: string
  user_metadata?: UserMetadataI
  app_metadata?: Record<string, any>
}

export interface UserMetadataI {
  first_name?: string
  last_name?: string
  avatar_url?: string
  [key: string]: any
}

export interface SessionI {
  access_token: string
  refresh_token: string
  expires_at: number
  expires_in: number
  token_type: string
}

export interface AuthResponseI {
  success: boolean
  user?: UserI
  session?: SessionI
  message?: string
  error?: string
}

// Auth Request Types
export interface RegisterRequestI {
  email: string
  password: string
  first_name?: string
  last_name?: string
  metadata?: Record<string, any>
}

export interface LoginRequestI {
  email: string
  password: string
}

export interface PasswordResetRequestI {
  email?: string
  new_password?: string
  access_token?: string
  action: 'request' | 'confirm'
}

export interface EmailVerificationRequestI {
  email?: string
  token?: string
  action: 'resend' | 'confirm'
}

export interface UpdateProfileRequestI {
  first_name?: string
  last_name?: string
  avatar_url?: string
  metadata?: Record<string, any>
}

export interface RefreshRequestI {
  refresh_token: string
}

// =============================================================================
// Payment Types
// =============================================================================

export interface PaymentTransactionI {
  id: string
  user_id?: string
  order_id?: string
  stripe_payment_intent_id: string
  stripe_charge_id?: string
  stripe_customer_id?: string
  amount: number
  currency: string
  status: PaymentStatusT
  payment_method_type?: string
  payment_method_details?: Record<string, any>
  error_message?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreatePaymentIntentRequestI {
  amount: number
  currency?: string
  line_items?: any[]
  shipping_address?: ShippingAddressI
  metadata?: Record<string, any>
  payment_method?: string
  confirm?: boolean
}

export interface PaymentIntentResponseI {
  success: boolean
  clientSecret: string
  paymentIntentId: string
}

// Payment Types
export type PaymentStatusT = 'processing' | 'succeeded' | 'failed' | 'canceled'

// =============================================================================
// Printify Types
// =============================================================================

export interface ShippingAddressI {
  first_name: string
  last_name?: string
  email: string
  phone?: string
  country: string
  region?: string
  address1?: string
  address2?: string
  city?: string
  zip?: string
}

export interface PrintAreaI {
  front?: string
  back?: string
}

export interface CreateCustomProductRequestI {
  blueprint_id: number
  print_provider_id: number
  image_id?: string // Legacy support
  print_areas?: PrintAreaI
  title?: string
  description?: string
  variants?: number[]
  user_id: string
  customer_email: string
}

export interface ProductVariantI {
  id: number
  title: string
  price: number
  cost?: number
  is_enabled: boolean
  is_available?: boolean
  options?: {
    color?: string
    size?: string
    [key: string]: any
  }
}

export interface ProductI {
  id: string
  title: string
  description?: string
  tags?: string[]
  images?: {
    src: string
    position: string
    is_default: boolean
  }[]
  variants: ProductVariantI[]
  print_areas?: any
  blueprint_id?: number
  print_provider_id?: number
}

export interface BlueprintI {
  id: number
  title: string
  description: string
  brand: string
  model: string
  images: string[]
  printAreas: Array<{
    position: string
    width: number
    height: number
  }>
}

export interface OrderLineItemI {
  product_id?: string
  blueprint_id?: number
  print_provider_id?: number
  variant_id: number
  quantity: number
  print_areas?: PrintAreaI
  print_details?: any
  sku?: string
}

export interface CreatePrintifyOrderRequestI {
  line_items?: OrderLineItemI[]
  shipping_method?: number
  shipping_address?: ShippingAddressI
  address_to?: ShippingAddressI
  is_test?: boolean
  metadata?: Record<string, any>
  use_sample_order?: boolean
}

export interface UploadImageRequestI {
  image_url?: string
  image_base64?: string
  file_name?: string
}

export interface UploadImageResponseI {
  success: boolean
  image: {
    id: string
    file_name: string
    height: number
    width: number
    size: number
    mime_type: string
    preview_url: string
  }
}

// =============================================================================
// Error Code Types
// =============================================================================

export type ErrorCodeT =
  // Validation errors (400)
  | 'BLUEPRINT_ID_REQUIRED'
  | 'PRINT_PROVIDER_ID_REQUIRED'
  | 'IMAGE_REQUIRED'
  | 'EMAIL_REQUIRED'
  | 'PASSWORD_REQUIRED'
  | 'INVALID_EMAIL_FORMAT'
  | 'PASSWORD_TOO_SHORT'
  | 'AMOUNT_REQUIRED'
  | 'INVALID_AMOUNT'
  | 'INVALID_REQUEST_BODY'
  | 'IMAGE_URL_OR_BASE64_REQUIRED'
  | 'NO_LINE_ITEMS'
  | 'MISSING_SHIPPING_ADDRESS'
  | 'WEBHOOK_SIGNATURE_MISSING'

  // Authentication errors (401)
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_CONFIRMED'
  | 'INVALID_TOKEN'
  | 'WEBHOOK_SIGNATURE_INVALID'

  // Not found errors (404)
  | 'USER_NOT_FOUND'

  // Conflict errors (409)
  | 'EMAIL_ALREADY_REGISTERED'

  // Environment/Config errors (500)
  | 'PRINTIFY_TOKEN_MISSING'
  | 'PRINTIFY_SHOP_ID_MISSING'
  | 'STRIPE_SECRET_KEY_MISSING'
  | 'STRIPE_WEBHOOK_SECRET_MISSING'
  | 'SUPABASE_URL_MISSING'
  | 'SUPABASE_SERVICE_ROLE_KEY_MISSING'

  // External API errors (502)
  | 'NO_VARIANTS_AVAILABLE'
  | 'NO_PRODUCTS_IN_SHOP'
  | 'PRINTIFY_API_ERROR'
  | 'PRINTIFY_ORDER_API_ERROR'
  | 'IMAGE_UPLOAD_API_ERROR'
  | 'STRIPE_API_ERROR'
  | 'AUTH_REGISTRATION_FAILED'
  | 'AUTH_LOGIN_FAILED'
  | 'PASSWORD_RESET_FAILED'
  | 'CUSTOM_PRODUCT_CREATION_FAILED'
  | 'TSHIRT_PRODUCTS_FETCH_FAILED'

  // Generic errors
  | 'INTERNAL_ERROR'
  | 'UNKNOWN_ERROR'

export interface ErrorResponseI {
  error: ErrorCodeT | string
}

// =============================================================================
// Utility Types
// =============================================================================

export type WithTimestamps<T> = T & {
  created_at: string
  updated_at: string
}