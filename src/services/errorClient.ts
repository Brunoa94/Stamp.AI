import z from "zod";

export class ErrorClient {
    constructor(){}

    static handleError({error, service, action}:{error: unknown, service: string, action: string}){
        const serviceIdentifier = `${service} - ${action} failed`

        if (error instanceof z.ZodError) {
            return new Error(`Zod - ${serviceIdentifier}: ${error.message}`);
        }

        // Handle network errors, parsing errors, and other exceptions
        if (error instanceof Error) {
            // Re-throw known errors with context
            return new Error(`${serviceIdentifier}: ${error.message}`);
        }

        // Handle unknown errors
        return new Error(`${serviceIdentifier}: Unknown error occurred`);
    }
}