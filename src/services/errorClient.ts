import z from "zod";
import { ErrorCodeT } from "@/shared-types";

export class AppError extends Error {
    public readonly code?: ErrorCodeT;

    constructor(message: string, code?: ErrorCodeT) {
        super(message);
        this.name = "AppError";
        this.code = code;
    }
}

export class ErrorClient {
    constructor(){}

    static handleError({error, service, action}:{error: unknown, service: string, action: string}){
        const serviceIdentifier = `${service} - ${action} failed`

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