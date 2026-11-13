import { AuthService } from "./authService";
import { CartService } from "./cartService";
import {
  GuestClaimStorageService,
  type PendingGuestClaimT,
} from "./guestClaimStorageService";
import { LocalCartStorageService } from "./localCartStorageService";
import { mapLocalCartItemToAddToCartInput } from "@/shared/mappers/localCartMapper";
import { GuestClaimExpiredError } from "@/shared/errors/GuestClaimExpiredError";

type AccountT = { id: string; email?: string };

/**
 * After a guest logs in or registers: move their products to the account
 * (unless Google was linked to the same user), then copy their local cart
 * into the account's database cart. The local cart keeps the items, marked
 * with the account (mergedInto): they stay visible after logout, need that
 * login to be checked out, and are not copied again on the next login. If
 * the claim fails nothing is moved, and the local cart and pending claim
 * stay for another try. If the products can no longer be claimed, the
 * unmerged items are dropped: nobody could pay for products it does not own.
 *
 * Every open tab sees the new session, so the merge holds a cross-tab lock:
 * a second tab waits, then finds the bag already merged.
 */
export async function mergeGuestCartIntoAccount(account: AccountT): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    await navigator.locks.request("merge-guest-cart", () => mergeOnce(account));
    return;
  }
  await mergeOnce(account);
}

/** A still-valid guest access token: the saved one, or a refreshed one once it expired. */
async function claimableToken(pending: PendingGuestClaimT): Promise<string> {
  if (GuestClaimStorageService.isClaimable(pending)) return pending.accessToken;
  if (!pending.refreshToken) throw new GuestClaimExpiredError();

  const refreshed = await AuthService.refreshAnonymousSession(pending.refreshToken);
  if (refreshed.userId !== pending.userId) throw new GuestClaimExpiredError();
  GuestClaimStorageService.updateTokens(refreshed);
  return refreshed.accessToken;
}

async function mergeOnce(account: AccountT): Promise<void> {
  const pending = GuestClaimStorageService.read();
  // Items already copied into an account (this one or another) stay in the
  // bag as they are; only new guest items are merged.
  const items = LocalCartStorageService.getItems().filter((item) => !item.mergedInto);
  if (!pending && items.length === 0) return;

  if (pending?.userId !== account.id) {
    try {
      if (!pending) throw new GuestClaimExpiredError();
      await AuthService.claimGuestProducts(await claimableToken(pending));
    } catch (error) {
      if (error instanceof GuestClaimExpiredError) {
        // Nobody can pay for these any more; merged items are kept.
        for (const item of items) LocalCartStorageService.removeItem(item.id);
        GuestClaimStorageService.clear();
      }
      throw error;
    }
    // The products now belong to the account: a retry must not claim again.
    GuestClaimStorageService.save({ ...pending, userId: account.id });
  }

  if (items.length > 0) {
    const cart = await CartService.getOrCreateCart(account.id, undefined, account.email);
    for (const item of items) {
      await CartService.addToCart(cart.id, mapLocalCartItemToAddToCartInput(item));
      // Adding increments the quantity: a retry must not add this item twice.
      LocalCartStorageService.markMerged([item.id], account.id);
    }
  }

  GuestClaimStorageService.clear();
}
