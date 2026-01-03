import { ErrorCodeT } from '@/types/index'
import { useCallback } from 'react'
import { toast } from 'sonner'

// Error messages mapping for better UX
const ERROR_MESSAGES: Record<ErrorCodeT, string> = {
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

  // Authentication errors (401)
  'INVALID_CREDENTIALS': 'Invalid email or password',
  'EMAIL_NOT_CONFIRMED': 'Please verify your email address before signing in',
  'INVALID_TOKEN': 'Your session has expired. Please sign in again',
  'WEBHOOK_SIGNATURE_INVALID': 'Invalid webhook signature',

  // Not found errors (404)
  'USER_NOT_FOUND': 'User account not found',

  // Conflict errors (409)
  'EMAIL_ALREADY_REGISTERED': 'This email address is already registered',

  // Environment/Config errors (500)
  'PRINTIFY_TOKEN_MISSING': 'Print service configuration error',
  'PRINTIFY_SHOP_ID_MISSING': 'Print shop configuration error',
  'STRIPE_SECRET_KEY_MISSING': 'Payment service configuration error',
  'STRIPE_WEBHOOK_SECRET_MISSING': 'Webhook configuration error',
  'SUPABASE_URL_MISSING': 'Database configuration error',
  'SUPABASE_SERVICE_ROLE_KEY_MISSING': 'Database authentication error',

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

  // Generic errors
  'INTERNAL_ERROR': 'An internal error occurred. Please try again',
  'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again'
}

export interface UseErrorHandlerOptionsI {
  showToast?: boolean
  customMessages?: Partial<Record<ErrorCodeT, string>>
}

export const useErrorHandler = (options: UseErrorHandlerOptionsI = {}) => {
  const { showToast = true, customMessages = {} } = options

  const handleError = useCallback((error: any) => {
    let errorCode: ErrorCodeT = 'UNKNOWN_ERROR'
    let errorMessage = 'An unexpected error occurred'

    // Extract error code from different error formats
    if (error?.error) {
      errorCode = error.error as ErrorCodeT
    } else if (error?.response?.data?.error) {
      errorCode = error.response.data.error as ErrorCodeT
    } else if (error?.message) {
      errorMessage = error.message
    }

    // Get user-friendly message
    if (errorCode && ERROR_MESSAGES[errorCode]) {
      errorMessage = customMessages[errorCode] || ERROR_MESSAGES[errorCode]
    }

    // Show toast notification
    if (showToast) {
      const toastMessage = errorCode && errorCode !== 'UNKNOWN_ERROR'
        ? `${errorMessage} (Code: ${errorCode})`
        : errorMessage;

      toast.error(toastMessage, {
        duration: 5000,
        position: 'top-right'
      })
    }

    console.error('API Error:', { errorCode, errorMessage, originalError: error })

    return {
      code: errorCode,
      message: errorMessage,
      originalError: error
    }
  }, [showToast, customMessages])

  const handleSuccess = useCallback((message: string) => {
    if (showToast) {
      toast.success(message, {
        duration: 3000,
        position: 'top-right'
      })
    }
  }, [showToast])

  return {
    handleError,
    handleSuccess
  }
}