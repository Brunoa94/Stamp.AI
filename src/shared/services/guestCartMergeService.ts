import { AuthService } from "./authService";
import { CartService } from "./cartService";
import { GuestClaimStorageService } from "./guestClaimStorageService";
import { LocalCartStorageService } from "./localCartStorageService";
import { mapLocalCartItemToAddToCartInput } from "@/shared/mappers/localCartMapper";

/** True when there is guest state waiting to be merged into an account. */
export function hasGuestCartToMerge(): boolean {
  return GuestClaimStorageService.read() !== null ||
    LocalCartStorageService.getItems().length > 0;
}

/**
 * After a guest logs in or registers: move their products to the account
 * (unless Google was linked to the same user), then add their local cart to
 * the account's database cart and clear it. If the claim fails nothing is
 * moved, and the local cart and pending claim stay for another try.
 */
export async function mergeGuestCartIntoAccount(
  account: { id: string; email?: string },
): Promise<void> {
  const pending = GuestClaimStorageService.read();
  const items = LocalCartStorageService.getItems();
  if (!pending && items.length === 0) return;

  if (pending && pending.userId !== account.id) {
    await AuthService.claimGuestProducts(pending.accessToken);
  }

  if (items.length > 0) {
    const cart = await CartService.getOrCreateCart(account.id, undefined, account.email);
    for (const item of items) {
      await CartService.addToCart(cart.id, mapLocalCartItemToAddToCartInput(item));
    }
  }

  LocalCartStorageService.clear();
  GuestClaimStorageService.clear();
}
