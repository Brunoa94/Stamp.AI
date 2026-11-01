/**
 * Error whose message is safe to display to the user verbatim.
 *
 * Payment return pages throw many errors: some are intentionally created
 * with translated, user-friendly messages, while others bubble up from
 * services (database, fetch, JSON parsing) with technical messages that
 * must never reach an alert. Wrapping the intentional ones in this class
 * lets catch blocks distinguish the two and fall back to a generic
 * translated message for everything else.
 */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

/**
 * Resolve the message to show in a user-facing alert: the error's own
 * message when it was intentionally created for display, otherwise the
 * provided user-friendly fallback.
 */
export function getUserFacingMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  return error instanceof UserFacingError ? error.message : fallbackMessage;
}
