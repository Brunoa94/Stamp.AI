/**
 * GuestClaimStorageService
 *
 * Remembers a guest's anonymous session just before they log in, register or
 * leave for Google, so that once a registered session appears (possibly
 * after a full redirect) their products can be claimed and their local cart
 * merged. Kept in localStorage because an email confirmation link can open
 * in a new tab.
 */

import { LocalCartStorageService } from "./localCartStorageService";

export type PendingGuestClaimT = {
  /** The anonymous session's access token, proof of the guest identity. */
  accessToken: string;
  /**
   * Gets a new access token once that one expires (an email confirmed long
   * after sign-up). Missing on records saved before it was kept.
   */
  refreshToken?: string;
  /** Who owns the guest's products: the anonymous user, or the account once claimed. */
  userId: string;
  /** When the access token expires (ms); it can no longer claim after that. */
  expiresAt: number;
};

const PENDING_CLAIM_KEY = "stamp:pending-guest-claim";
/** The record lives as long as the local cart it belongs to. */
const RECORD_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

type StoredClaimT = PendingGuestClaimT & { savedAt: number };

function write(record: StoredClaimT): void {
  try {
    localStorage.setItem(PENDING_CLAIM_KEY, JSON.stringify(record));
  } catch { /* Storage can be unavailable. */ }
}

function readRecord(): StoredClaimT | null {
  try {
    const stored = localStorage.getItem(PENDING_CLAIM_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored) as Partial<StoredClaimT>;
    if (
      typeof data.accessToken !== "string" ||
      typeof data.userId !== "string" ||
      typeof data.expiresAt !== "number" ||
      typeof data.savedAt !== "number" ||
      Date.now() - data.savedAt > RECORD_LIFETIME_MS
    ) {
      return null;
    }
    return {
      accessToken: data.accessToken,
      refreshToken: typeof data.refreshToken === "string" ? data.refreshToken : undefined,
      userId: data.userId,
      expiresAt: data.expiresAt,
      savedAt: data.savedAt,
    };
  } catch {
    return null;
  }
}

export class GuestClaimStorageService {
  static save(claim: PendingGuestClaimT): void {
    write({ ...claim, savedAt: Date.now() });
  }

  static read(): PendingGuestClaimT | null {
    const record = readRecord();
    if (!record) return null;
    const { savedAt: _savedAt, ...claim } = record;
    return claim;
  }

  /**
   * Keeps a waiting claim's tokens current while the guest's anonymous
   * session refreshes (before the confirmation link is opened). A refresh
   * token is single-use, so the saved one must follow the session's.
   */
  static updateTokens(claim: PendingGuestClaimT): void {
    const record = readRecord();
    if (!record || record.userId !== claim.userId) return;
    write({ ...record, ...claim });
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

/**
 * True when there is guest state waiting to be merged into an account.
 * Storage reads only: the merge itself (and the cart service) loads on demand.
 */
export function hasGuestCartToMerge(): boolean {
  return GuestClaimStorageService.read() !== null ||
    LocalCartStorageService.getItems().some((item) => !item.mergedInto);
}
