/**
 * Structured Logger
 *
 * A production-ready logging utility that outputs structured JSON logs.
 * Designed for easy integration with log aggregation services
 * (Loki, OpenObserve, Elasticsearch, etc.)
 *
 * Features:
 * - Structured JSON output for machine parsing
 * - Log levels (debug, info, warn, error)
 * - Automatic context injection (timestamp, requestId, etc.)
 * - Service/feature scoping
 * - Error serialization
 * - Development-friendly console output
 */

import { getRequestId, getUser } from "./errorCapture";

/**
 * Log levels in order of severity
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Structured log entry
 */
export interface LogEntry {
  /** ISO timestamp */
  timestamp: string;
  /** Log level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Service/feature name */
  service?: string;
  /** Action/event name */
  action?: string;
  /** Request ID for correlation */
  requestId?: string;
  /** User ID if authenticated */
  userId?: string;
  /** Error details if applicable */
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Environment */
  env: string;
  /** App version */
  version?: string;
}

/**
 * Logger options
 */
export interface LoggerOptions {
  /** Service/feature name for all logs from this logger */
  service: string;
  /** Minimum log level to output */
  minLevel?: LogLevel;
  /** Additional default metadata */
  defaultMetadata?: Record<string, unknown>;
}

/**
 * Log method options
 */
export interface LogOptions {
  /** Action/event being logged */
  action?: string;
  /** Error to serialize */
  error?: unknown;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// Configuration
const config = {
  minLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || "info",
  environment: process.env.NODE_ENV || "development",
  version: process.env.NEXT_PUBLIC_APP_VERSION,
  jsonOutput: process.env.NODE_ENV === "production",
};

/**
 * Serialize an error for structured logging
 */
function serializeError(error: unknown): LogEntry["error"] | undefined {
  if (!error) return undefined;

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as { code?: string }).code,
    };
  }

  if (typeof error === "string") {
    return {
      name: "Error",
      message: error,
    };
  }

  let message: string;
  try {
    message = JSON.stringify(error);
  } catch {
    // Handle circular references or other serialization errors
    message = String(error);
  }
  return {
    name: "UnknownError",
    message,
  };
}

/**
 * Format log entry for console output (development mode)
 */
function formatForConsole(entry: LogEntry): string[] {
  const prefix = `[${entry.service || "app"}]`;
  const levelColors: Record<LogLevel, string> = {
    debug: "\x1b[90m", // gray
    info: "\x1b[36m", // cyan
    warn: "\x1b[33m", // yellow
    error: "\x1b[31m", // red
  };
  const reset = "\x1b[0m";
  const color = levelColors[entry.level];

  const parts: string[] = [
    `${color}${entry.level.toUpperCase()}${reset}`,
    prefix,
    entry.message,
  ];

  if (entry.action) {
    parts.push(`[${entry.action}]`);
  }

  return parts;
}

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel];
}

/**
 * Output a log entry
 */
function output(entry: LogEntry, minLevel: LogLevel): void {
  if (!shouldLog(entry.level, minLevel)) {
    return;
  }

  if (config.jsonOutput) {
    // Production: JSON output for log aggregation
    const logMethod = entry.level === "error" ? console.error : console.log;
    logMethod(JSON.stringify(entry));
  } else {
    // Development: Formatted console output
    const parts = formatForConsole(entry);
    const logMethod =
      entry.level === "error"
        ? console.error
        : entry.level === "warn"
          ? console.warn
          : console.log;

    if (entry.error) {
      logMethod(...parts, "\n", entry.error);
    } else if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      logMethod(...parts, entry.metadata);
    } else {
      logMethod(...parts);
    }
  }
}

/**
 * Create a structured logger instance
 *
 * @param options - Logger configuration
 * @returns Logger instance with log methods
 *
 * @example
 * ```ts
 * const logger = createLogger({ service: "PaymentService" });
 *
 * logger.info("Processing payment", {
 *   action: "processPayment",
 *   metadata: { orderId: "123", amount: 99.99 }
 * });
 *
 * try {
 *   await chargeCard();
 * } catch (error) {
 *   logger.error("Payment failed", {
 *     action: "chargeCard",
 *     error,
 *     metadata: { orderId: "123" }
 *   });
 * }
 * ```
 */
export function createLogger(options: LoggerOptions) {
  const { service, minLevel = config.minLevel, defaultMetadata = {} } = options;

  const createLogMethod = (level: LogLevel) => {
    return (message: string, logOptions: LogOptions = {}) => {
      const user = getUser();
      const requestId = getRequestId();

      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        service,
        action: logOptions.action,
        requestId: requestId || undefined,
        userId: user?.id,
        error: serializeError(logOptions.error),
        metadata: {
          ...defaultMetadata,
          ...logOptions.metadata,
        },
        env: config.environment,
        version: config.version,
      };

      // Remove undefined values
      Object.keys(entry).forEach((key) => {
        if (entry[key as keyof LogEntry] === undefined) {
          delete entry[key as keyof LogEntry];
        }
      });

      // Remove empty metadata
      if (entry.metadata && Object.keys(entry.metadata).length === 0) {
        delete entry.metadata;
      }

      output(entry, minLevel);

      return entry;
    };
  };

  return {
    debug: createLogMethod("debug"),
    info: createLogMethod("info"),
    warn: createLogMethod("warn"),
    error: createLogMethod("error"),

    /**
     * Create a child logger with additional context
     */
    child: (childOptions: Partial<LoggerOptions>) =>
      createLogger({
        service: childOptions.service || service,
        minLevel: childOptions.minLevel || minLevel,
        defaultMetadata: {
          ...defaultMetadata,
          ...childOptions.defaultMetadata,
        },
      }),
  };
}

/**
 * Default application logger
 */
export const logger = createLogger({ service: "app" });

/**
 * Pre-configured loggers for common services
 */
export const loggers = {
  auth: createLogger({ service: "auth" }),
  payment: createLogger({ service: "payment" }),
  order: createLogger({ service: "order" }),
  cart: createLogger({ service: "cart" }),
  api: createLogger({ service: "api" }),
  stamp: createLogger({ service: "stamp" }),
};

/**
 * Quick log functions for one-off logging
 */
export const log = {
  debug: (message: string, options?: LogOptions) =>
    logger.debug(message, options),
  info: (message: string, options?: LogOptions) =>
    logger.info(message, options),
  warn: (message: string, options?: LogOptions) =>
    logger.warn(message, options),
  error: (message: string, options?: LogOptions) =>
    logger.error(message, options),
};
