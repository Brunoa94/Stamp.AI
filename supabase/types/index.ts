// Shared types for both Supabase functions and frontend

// =============================================================================
// Success Message Types
// =============================================================================

export type SuccessCodeT =
  // Authentication success messages
  | 'EMAIL_VERIFICATION_SENT'
  | 'EMAIL_VERIFIED_SUCCESSFULLY'
  | 'PASSWORD_RESET_SENT'
  | 'PASSWORD_RESET_SUCCESSFUL'
  | 'USER_REGISTERED_SUCCESSFULLY'
  | 'USER_LOGGED_IN_SUCCESSFULLY'
  | 'USER_LOGGED_OUT_SUCCESSFULLY'
  | 'PROFILE_UPDATED_SUCCESSFULLY'

  // Payment success messages
  | 'PAYMENT_INTENT_CREATED'
  | 'PAYMENT_PROCESSED_SUCCESSFULLY'
  | 'REFUND_PROCESSED_SUCCESSFULLY'

  // Product/Order success messages
  | 'PRODUCT_CREATED_SUCCESSFULLY'
  | 'ORDER_CREATED_SUCCESSFULLY'
  | 'ORDER_UPDATED_SUCCESSFULLY'
  | 'IMAGE_UPLOADED_SUCCESSFULLY'

  // Generic success messages
  | 'OPERATION_SUCCESSFUL'
  | 'DATA_SAVED_SUCCESSFULLY'
  | 'DATA_DELETED_SUCCESSFULLY'

export const SuccessMessages: Record<SuccessCodeT, string> = {
  // Authentication
  EMAIL_VERIFICATION_SENT: 'Verification email sent. Please check your email and click the verification link.',
  EMAIL_VERIFIED_SUCCESSFULLY: 'Email verified successfully. You can now log in.',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email.',
  PASSWORD_RESET_SUCCESSFUL: 'Password reset successfully.',
  USER_REGISTERED_SUCCESSFULLY: 'User registered successfully.',
  USER_LOGGED_IN_SUCCESSFULLY: 'User logged in successfully.',
  USER_LOGGED_OUT_SUCCESSFULLY: 'User logged out successfully.',
  PROFILE_UPDATED_SUCCESSFULLY: 'Profile updated successfully.',

  // Payment
  PAYMENT_INTENT_CREATED: 'Payment intent created successfully.',
  PAYMENT_PROCESSED_SUCCESSFULLY: 'Payment processed successfully.',
  REFUND_PROCESSED_SUCCESSFULLY: 'Refund processed successfully.',

  // Product/Order
  PRODUCT_CREATED_SUCCESSFULLY: 'Product created successfully.',
  ORDER_CREATED_SUCCESSFULLY: 'Order created successfully.',
  ORDER_UPDATED_SUCCESSFULLY: 'Order updated successfully.',
  IMAGE_UPLOADED_SUCCESSFULLY: 'Image uploaded successfully.',

  // Generic
  OPERATION_SUCCESSFUL: 'Operation completed successfully.',
  DATA_SAVED_SUCCESSFULLY: 'Data saved successfully.',
  DATA_DELETED_SUCCESSFULLY: 'Data deleted successfully.',
}

export interface SuccessResponseI<T = any> {
  success: true
  data?: T
  message: string
  code: SuccessCodeT
}

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

// Payment provider discriminator
export type PaymentProviderT = 'stripe' | 'paypal' | 'mollie'

// Payment status (includes refunded for PayPal)
export type PaymentStatusT = 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded'

export interface PaymentTransactionI {
  id: string
  user_id?: string
  order_id?: string
  payment_provider: PaymentProviderT
  // Stripe fields (optional when using PayPal/Mollie)
  stripe_payment_intent_id?: string
  stripe_charge_id?: string
  stripe_customer_id?: string
  // PayPal fields (optional when using Stripe/Mollie)
  paypal_order_id?: string
  paypal_capture_id?: string
  paypal_payer_id?: string
  paypal_payer_email?: string
  // Mollie fields (optional when using Stripe/PayPal)
  mollie_payment_id?: string
  mollie_status?: string
  // Common fields
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

// Stripe Types
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

// PayPal Types
export interface PayPalOrderRequestI {
  amount: number
  currency?: string
  line_items?: any[]
  shipping_address?: ShippingAddressI
  metadata?: Record<string, any>
}

export interface PayPalOrderResponseI {
  success: boolean
  orderId: string
  approvalUrl?: string
}

export interface PayPalCaptureRequestI {
  orderId: string
  payerId?: string
}

export interface PayPalCaptureResponseI {
  success: boolean
  captureId: string
  status: string
  payerEmail?: string
  error?: string
  restartable?: boolean
}

// Mollie Types
export interface MolliePaymentRequestI {
  amount: number
  currency?: string
  description?: string
  order_id?: string
  line_items?: any[]
  shipping_address?: ShippingAddressI
  metadata?: Record<string, any>
}

export interface MolliePaymentResponseI {
  success: boolean
  paymentId: string
  checkoutUrl: string
}

export interface MollieVerifyRequestI {
  paymentId: string
}

export interface MollieVerifyResponseI {
  success: boolean
  paymentId: string
  status: 'open' | 'canceled' | 'pending' | 'authorized' | 'expired' | 'failed' | 'paid'
  isPaid: boolean
  metadata?: Record<string, any>
}

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
  selected_color?: string | null
  selected_size?: string | null
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
  | 'PAYPAL_ORDER_ID_REQUIRED'
  | 'PAYPAL_CAPTURE_FAILED'
  | 'PAYPAL_WEBHOOK_SIGNATURE_INVALID'

  // Authentication errors (401)
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_CONFIRMED'
  | 'INVALID_TOKEN'
  | 'WEBHOOK_SIGNATURE_INVALID'

  // Not found errors (404)
  | 'USER_NOT_FOUND'
  | 'PAYPAL_ORDER_NOT_FOUND'

  // Conflict errors (409)
  | 'EMAIL_ALREADY_REGISTERED'

  // Environment/Config errors (500)
  | 'PRINTIFY_TOKEN_MISSING'
  | 'PRINTIFY_SHOP_ID_MISSING'
  | 'STRIPE_SECRET_KEY_MISSING'
  | 'STRIPE_WEBHOOK_SECRET_MISSING'
  | 'SUPABASE_URL_MISSING'
  | 'SUPABASE_SERVICE_ROLE_KEY_MISSING'
  | 'PAYPAL_CLIENT_ID_MISSING'
  | 'PAYPAL_CLIENT_SECRET_MISSING'
  | 'PAYPAL_WEBHOOK_ID_MISSING'
  | 'MOLLIE_API_KEY_MISSING'

  // External API errors (502)
  | 'NO_VARIANTS_AVAILABLE'
  | 'NO_PRODUCTS_IN_SHOP'
  | 'PRINTIFY_API_ERROR'
  | 'PRINTIFY_ORDER_API_ERROR'
  | 'IMAGE_UPLOAD_API_ERROR'
  | 'STRIPE_API_ERROR'
  | 'PAYPAL_API_ERROR'
  | 'MOLLIE_API_ERROR'
  | 'MOLLIE_PAYMENT_NOT_FOUND'
  | 'MOLLIE_PAYMENT_FAILED'
  | 'MOLLIE_PAYMENT_ID_REQUIRED'
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