type StampLogLevel = "info" | "warn" | "error";

interface StampLogOptions {
    scope: string;
    event: string;
    error?: unknown;
    metadata?: Record<string, unknown>;
}

function serializeError(error: unknown): Record<string, unknown> | undefined {
    if (!error) {
        return undefined;
    }

    if (error instanceof Error) {
        return {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
        };
    }

    return {
        errorValue: String(error),
    };
}

function logStamp(level: StampLogLevel, options: StampLogOptions): void {
    const payload = {
        feature: "stamp",
        scope: options.scope,
        event: options.event,
        ...serializeError(options.error),
        ...(options.metadata || {}),
    };

    console[level]("[Stamp]", payload);
}

export function logStampInfo(options: StampLogOptions): void {
    logStamp("info", options);
}

export function logStampWarn(options: StampLogOptions): void {
    logStamp("warn", options);
}

export function logStampError(options: StampLogOptions): void {
    logStamp("error", options);
}
