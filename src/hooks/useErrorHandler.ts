import { ErrorCodeT } from '@/shared-types'
import { ERROR_MESSAGES } from '@/constants/errorMessages'
import { useCallback } from 'react'
import { toast } from 'sonner'

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
    if (error?.code) {
      // Typed app error: { code: "ERROR_CODE" }
      errorCode = error.code as ErrorCodeT
    } else if (error?.error) {
      // Structured error object: { error: "ERROR_CODE" }
      errorCode = error.error as ErrorCodeT
    } else if (error?.response?.data?.error) {
      // Axios-style response: { response: { data: { error: "ERROR_CODE" } } }
      errorCode = error.response.data.error as ErrorCodeT
    } else if (error?.message) {
      errorMessage = error.message
      // Backend error codes are embedded in the message by ErrorClient:
      // "Service - Action failed: HTTP 400: ERROR_CODE"
      // Scan the message for any known ErrorCodeT to surface the mapped UX message.
      const knownCodes = Object.keys(ERROR_MESSAGES) as ErrorCodeT[]
      const embedded = knownCodes.find(code => (error.message as string).includes(code))
      if (embedded) {
        errorCode = embedded
      }
    }

    // Get user-friendly message
    // Only apply the mapped message when we have a real, specific error code.
    // If errorCode is still 'UNKNOWN_ERROR' it means the error was a plain Error
    // object (e.g. from ErrorClient) whose message was already extracted above —
    // overwriting it with the generic fallback would discard that context.
    if (errorCode !== 'UNKNOWN_ERROR' && ERROR_MESSAGES[errorCode]) {
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