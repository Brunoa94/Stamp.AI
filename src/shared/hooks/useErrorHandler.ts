import { ErrorCodeT } from "@/shared-types";
import { ERROR_CODES } from "@/shared/constants/errorMessages";
import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { captureError } from "@/lib/observability/errorCapture";
import { UserFacingError } from "@/shared/errors/UserFacingError";

export interface UseErrorHandlerOptionsI {
  showToast?: boolean;
  customMessages?: Partial<Record<ErrorCodeT, string>>;
}

// Only codes in ERROR_CODES have a translation under `errors.<CODE>`.
// Treating an arbitrary backend string as a code would render a missing
// translation key to the user, so anything else must fall back.
const isKnownErrorCode = (value: unknown): value is ErrorCodeT =>
  typeof value === "string" && ERROR_CODES.includes(value as ErrorCodeT);

const findEmbeddedErrorCode = (text: string): ErrorCodeT | undefined =>
  ERROR_CODES.find((code) => text.includes(code));

export const useErrorHandler = (options: UseErrorHandlerOptionsI = {}) => {
  const { showToast = true, customMessages = {} } = options;
  const t = useTranslations("errors");

  const handleError = useCallback((error: unknown) => {
    // The shapes errors arrive in; every field is checked before use.
    const shape = (error ?? {}) as {
      code?: unknown;
      error?: unknown;
      message?: unknown;
      response?: { data?: { error?: unknown } };
    };
    let errorCode: ErrorCodeT = "UNKNOWN_ERROR";
    // Kept for observability only: never shown to the user.
    let rawMessage: string | null = null;
    let hasCode = false;

    // Extract error code from different error formats. Each candidate field
    // is only accepted when it is a known ErrorCodeT — backends also put
    // free-text messages and third-party codes (Stripe, Postgres) in these
    // fields, and those must not be looked up as translation keys.
    if (isKnownErrorCode(shape.code)) {
      // Typed app error: { code: "ERROR_CODE" }
      errorCode = shape.code;
      hasCode = true;
    } else if (isKnownErrorCode(shape.error)) {
      // Structured error object: { error: "ERROR_CODE" }
      errorCode = shape.error;
      hasCode = true;
    } else if (isKnownErrorCode(shape.response?.data?.error)) {
      // Axios-style response: { response: { data: { error: "ERROR_CODE" } } }
      errorCode = shape.response.data.error;
      hasCode = true;
    } else if (typeof shape.message === "string" && shape.message) {
      rawMessage = shape.message;
      // Backend error codes are embedded in the message by ErrorClient:
      // "Service - Action failed: HTTP 400: ERROR_CODE"
      // Scan the message for any known ErrorCodeT to surface the mapped UX message.
      const embedded = findEmbeddedErrorCode(shape.message);
      if (embedded) {
        errorCode = embedded;
        hasCode = true;
      }
    } else if (typeof shape.error === "string") {
      // Structured error whose `error` field is a free-text message
      rawMessage = shape.error;
      const embedded = findEmbeddedErrorCode(shape.error);
      if (embedded) {
        errorCode = embedded;
        hasCode = true;
      }
    }

    // Resolve the user-facing message. Prefer a caller override, then the
    // translated message for a known code, then a UserFacingError's own
    // message, and finally the generic fallback. Any other message is
    // technical (database, fetch, ErrorClient context) and never shown.
    let errorMessage: string;
    if (hasCode && errorCode !== "UNKNOWN_ERROR") {
      errorMessage = customMessages[errorCode] || t(errorCode);
    } else if (error instanceof UserFacingError && error.message) {
      errorMessage = error.message;
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
