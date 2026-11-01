/**
 * GuestClaimStorageService
 *
 * Remembers a guest's anonymous session just before they log in, register or
 * leave for Google, so that once a registered session appears (possibly
 * after a full redirect) their products can be claimed and their local cart
 * merged. Kept in localStorage because an email confirmation link can open
 * in a new tab.
 */

export type PendingGuestClaimT = {
  /** The anonymous session's access token, proof of the guest identity. */
  accessToken: string;
  userId: string;
};

const PENDING_CLAIM_KEY = "stamp:pending-guest-claim";
/** Anonymous access tokens expire after an hour (auth.jwt_expiry). */
const CLAIM_LIFETIME_MS = 60 * 60 * 1000;

export class GuestClaimStorageService {
  static save(claim: PendingGuestClaimT): void {
    try {
      localStorage.setItem(
        PENDING_CLAIM_KEY,
        JSON.stringify({ ...claim, savedAt: Date.now() }),
      );
    } catch { /* Storage can be unavailable. */ }
  }

  static read(): PendingGuestClaimT | null {
    try {
      const stored = localStorage.getItem(PENDING_CLAIM_KEY);
      if (!stored) return null;
      const data = JSON.parse(stored) as Partial<PendingGuestClaimT & { savedAt: number }>;
      if (
        typeof data.accessToken !== "string" ||
        typeof data.userId !== "string" ||
        typeof data.savedAt !== "number" ||
        Date.now() - data.savedAt > CLAIM_LIFETIME_MS
      ) {
        return null;
      }
      return { accessToken: data.accessToken, userId: data.userId };
    } catch {
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(PENDING_CLAIM_KEY);
    } catch { /* Storage can be unavailable. */ }
  }
}
