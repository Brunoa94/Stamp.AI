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