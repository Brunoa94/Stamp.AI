import { ErrorCodeT } from "@/shared-types";
import { ERROR_CODES } from "@/constants/errorMessages";
import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { captureError } from "@/lib/observability/errorCapture";

export interface UseErrorHandlerOptionsI {
  showToast?: boolean;
  customMessages?: Partial<Record<ErrorCodeT, string>>;
}

export const useErrorHandler = (options: UseErrorHandlerOptionsI = {}) => {
  const { showToast = true, customMessages = {} } = options;
  const t = useTranslations("errors");

  const handleError = useCallback((error: any) => {
    let errorCode: ErrorCodeT = "UNKNOWN_ERROR";
    // Fallback for plain Error objects: their own message, if any.
    let rawMessage: string | null = null;
    let hasCode = false;

    // Extract error code from different error formats
    if (error?.code) {
      // Typed app error: { code: "ERROR_CODE" }
      errorCode = error.code as ErrorCodeT;
      hasCode = true;
    } else if (error?.error) {
      // Structured error object: { error: "ERROR_CODE" }
      errorCode = error.error as ErrorCodeT;
      hasCode = true;
    } else if (error?.response?.data?.error) {
      // Axios-style response: { response: { data: { error: "ERROR_CODE" } } }
      errorCode = error.response.data.error as ErrorCodeT;
      hasCode = true;
    } else if (error?.message) {
      rawMessage = error.message;
      // Backend error codes are embedded in the message by ErrorClient:
      // "Service - Action failed: HTTP 400: ERROR_CODE"
      // Scan the message for any known ErrorCodeT to surface the mapped UX message.
      const embedded = ERROR_CODES.find((code) =>
        (error.message as string).includes(code)
      );
      if (embedded) {
        errorCode = embedded;
        hasCode = true;
      }
    }

    // Resolve the user-facing message. Prefer a caller override, then the
    // translated message for a known code, then a plain Error's own message,
    // and finally the generic fallback.
    let errorMessage: string;
    if (hasCode && errorCode !== "UNKNOWN_ERROR") {
      errorMessage = customMessages[errorCode] || t(errorCode);
    } else if (rawMessage) {
      errorMessage = rawMessage;
    } else {
      errorMessage = t("UNKNOWN_ERROR");
    }

    // Capture error to Sentry
    captureError(error, {
      errorCode,
      service: "useErrorHandler",
      metadata: { hasCode, rawMessage },
    });

    // Show toast notification
    if (showToast) {
      const toastMessage = hasCode && errorCode !== "UNKNOWN_ERROR"
        ? t("withCode", { message: errorMessage, code: errorCode })
        : errorMessage;

      toast.error(toastMessage, {
        duration: 5000,
        position: "bottom-right",
      });
    }

    return {
      code: errorCode,
      message: errorMessage,
      originalError: error,
    };
  }, [showToast, customMessages, t]);

  const handleSuccess = useCallback((message: string) => {
    if (showToast) {
      toast.success(message, {
        duration: 3000,
        position: "bottom-right",
      });
    }
  }, [showToast]);

  return {
    handleError,
    handleSuccess,
  };
};
