import z from "zod";
import { ErrorCodeT } from "@/shared-types";
import { captureError, ErrorSeverity } from "@/lib/observability/errorCapture";

export class AppError extends Error {
    public readonly code?: ErrorCodeT;

    constructor(message: string, code?: ErrorCodeT) {
        super(message);
        this.name = "AppError";
        this.code = code;
    }
}

export interface HandleErrorOptions {
    error: unknown;
    service: string;
    action: string;
    severity?: ErrorSeverity;
}

export class ErrorClient {
    constructor(){}

    static handleError({ error, service, action, severity = "error" }: HandleErrorOptions){
        const serviceIdentifier = `${service} - ${action} failed`

        // Extract error code early for observability context
        let errorCode: ErrorCodeT | undefined;

        if (error instanceof AppError) {
            errorCode = error.code;
        } else if (
            typeof error === "object" &&
            error !== null &&
            "error" in error &&
            typeof (error as { error?: unknown }).error === "string"
        ) {
            errorCode = (error as { error: ErrorCodeT }).error;
        } else if (error instanceof Error) {
            errorCode = (error as { code?: ErrorCodeT }).code;
        }

        // Capture error for observability (fire-and-forget)
        captureError(error, {
            service,
            action,
            errorCode,
        }, severity);

        // Return wrapped error for query handling (existing behavior)
        if (error instanceof AppError) {
            return new AppError(`${serviceIdentifier}: ${error.message}`, error.code);
        }

        if (error instanceof z.ZodError) {
            return new AppError(`Zod - ${serviceIdentifier}: ${error.message}`);
        }

        // Handle network errors, parsing errors, and other exceptions
        if (error instanceof Error) {
            // Re-throw known errors with context
            const code = (error as { code?: ErrorCodeT }).code;
            return new AppError(`${serviceIdentifier}: ${error.message}`, code);
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "error" in error &&
            typeof (error as { error?: unknown }).error === "string"
        ) {
            const code = (error as { error: ErrorCodeT }).error;
            return new AppError(`${serviceIdentifier}: ${code}`, code);
        }

        // Handle unknown errors
        return new AppError(`${serviceIdentifier}: Unknown error occurred`);
    }
}