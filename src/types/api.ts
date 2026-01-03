// Frontend API types - re-exports from shared types for convenience
export type {
  // API Response Types
  ApiResponseI,
  ApiErrorI,
  ErrorResponseI,
  ErrorCodeT,

  // Authentication Types
  UserI,
  UserMetadataI,
  SessionI,
  AuthResponseI,
  RegisterRequestI,
  LoginRequestI,
  PasswordResetRequestI,
  EmailVerificationRequestI,
  UpdateProfileRequestI,
  RefreshRequestI,

  // Payment Types
  PaymentTransactionI,
  PaymentStatusT,
  CreatePaymentIntentRequestI,
  PaymentIntentResponseI,

  // Printify Types
  ShippingAddressI,
  PrintAreaI,
  CreateCustomProductRequestI,
  ProductVariantI,
  ProductI,
  BlueprintI,
  OrderLineItemI,
  CreatePrintifyOrderRequestI,
  UploadImageRequestI,
  UploadImageResponseI,

  // Utility Types
  WithTimestamps
} from '../../types/index'

// Frontend-specific types
export interface FetchOptionsI {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  token?: string
}

export interface UseApiOptionsI {
  onSuccess?: (data: any) => void
  onError?: (error: ApiErrorI) => void
  showToast?: boolean
}