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
  /** Who owns the guest's products: the anonymous user, or the account once claimed. */
  userId: string;
  /** When the access token expires (ms); it can no longer claim after that. */
  expiresAt: number;
};

const PENDING_CLAIM_KEY = "stamp:pending-guest-claim";
/** The record lives as long as the local cart it belongs to. */
const RECORD_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

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
        typeof data.expiresAt !== "number" ||
        typeof data.savedAt !== "number" ||
        Date.now() - data.savedAt > RECORD_LIFETIME_MS
      ) {
        return null;
      }
      return { accessToken: data.accessToken, userId: data.userId, expiresAt: data.expiresAt };
    } catch {
      return null;
    }
  }

  /** True while the guest's token can still prove the identity to claim. */
  static isClaimable(claim: PendingGuestClaimT): boolean {
    return Date.now() < claim.expiresAt;
  }

  static clear(): void {
    try {
      localStorage.removeItem(PENDING_CLAIM_KEY);
    } catch { /* Storage can be unavailable. */ }
  }
}
