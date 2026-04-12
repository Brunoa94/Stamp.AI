import { ErrorCodeT } from '@/shared-types'

export const ERROR_MESSAGES: Record<ErrorCodeT, string> = {
  // Validation errors (400)
  'BLUEPRINT_ID_REQUIRED': 'Blueprint ID is required',
  'PRINT_PROVIDER_ID_REQUIRED': 'Print provider ID is required',
  'IMAGE_REQUIRED': 'At least one image is required',
  'EMAIL_REQUIRED': 'Email address is required',
  'PASSWORD_REQUIRED': 'Password is required',
  'INVALID_EMAIL_FORMAT': 'Please enter a valid email address',
  'PASSWORD_TOO_SHORT': 'Password must be at least 8 characters long',
  'AMOUNT_REQUIRED': 'Amount is required',
  'INVALID_AMOUNT': 'Amount must be a positive number',
  'INVALID_REQUEST_BODY': 'Invalid request data',
  'IMAGE_URL_OR_BASE64_REQUIRED': 'Image URL or base64 data is required',
  'NO_LINE_ITEMS': 'No items found for this order',
  'MISSING_SHIPPING_ADDRESS': 'Shipping address is required',
  'WEBHOOK_SIGNATURE_MISSING': 'Invalid webhook signature',
  'MISSING_REQUIRED_FIELDS': 'Some required fields are missing',
  'PAYPAL_ORDER_ID_REQUIRED': 'PayPal order ID is required',
  'MOLLIE_PAYMENT_ID_REQUIRED': 'Mollie payment ID is required',
  'CREDITS_REQUIRED': 'Credits amount is required',
  'INVALID_CREDITS': 'Credits must be at least 10',

  // Authentication errors (401)
  'INVALID_CREDENTIALS': 'Invalid email or password',
  'EMAIL_NOT_CONFIRMED': 'Please verify your email address before signing in',
  'INVALID_TOKEN': 'Your session has expired. Please sign in again',
  'WEBHOOK_SIGNATURE_INVALID': 'Invalid webhook signature',
  'PAYPAL_WEBHOOK_SIGNATURE_INVALID': 'Invalid PayPal webhook signature',

  // Not found errors (404)
  'USER_NOT_FOUND': 'User account not found',
  'PAYPAL_ORDER_NOT_FOUND': 'PayPal order not found',
  'MOLLIE_PAYMENT_NOT_FOUND': 'Mollie payment not found',

  // Conflict errors (409)
  'EMAIL_ALREADY_REGISTERED': 'This email address is already registered',

  // Environment/Config errors (500)
  'PRINTIFY_TOKEN_MISSING': 'Print service configuration error',
  'PRINTIFY_SHOP_ID_MISSING': 'Print shop configuration error',
  'STRIPE_SECRET_KEY_MISSING': 'Payment service configuration error',
  'STRIPE_WEBHOOK_SECRET_MISSING': 'Webhook configuration error',
  'SUPABASE_URL_MISSING': 'Database configuration error',
  'SUPABASE_SERVICE_ROLE_KEY_MISSING': 'Database authentication error',
  'PAYPAL_CLIENT_ID_MISSING': 'PayPal configuration error',
  'PAYPAL_CLIENT_SECRET_MISSING': 'PayPal configuration error',
  'PAYPAL_WEBHOOK_ID_MISSING': 'PayPal webhook configuration error',
  'MOLLIE_API_KEY_MISSING': 'Mollie configuration error',
  'DATABASE_ERROR': 'Database operation failed',

  // External API errors (502)
  'NO_VARIANTS_AVAILABLE': 'No product variants available for this blueprint',
  'NO_PRODUCTS_IN_SHOP': 'No products available. Please create a product first',
  'PRINTIFY_API_ERROR': 'Print service error. Please try again',
  'PRINTIFY_ORDER_API_ERROR': 'Order creation failed. Please try again',
  'IMAGE_UPLOAD_API_ERROR': 'Image upload failed. Please try again',
  'STRIPE_API_ERROR': 'Payment processing error. Please try again',
  'AUTH_REGISTRATION_FAILED': 'Registration failed. Please try again',
  'AUTH_LOGIN_FAILED': 'Login failed. Please try again',
  'PASSWORD_RESET_FAILED': 'Password reset failed. Please try again',
  'CUSTOM_PRODUCT_CREATION_FAILED': 'Failed to create custom product. Please try again',
  'TSHIRT_PRODUCTS_FETCH_FAILED': 'Failed to load t-shirt products. Please try again',
  'PAYPAL_API_ERROR': 'PayPal service error. Please try again',
  'PAYPAL_CAPTURE_FAILED': 'PayPal payment capture failed. Please try again',
  'MOLLIE_API_ERROR': 'Mollie service error. Please try again',
  'MOLLIE_PAYMENT_FAILED': 'Mollie payment failed. Please try again',

  // Generic errors
  'INTERNAL_ERROR': 'An internal error occurred. Please try again',
  'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again'
}
