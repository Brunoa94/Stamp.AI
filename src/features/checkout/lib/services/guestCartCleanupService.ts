import { isRegisteredUser } from "@/shared/helpers/authIdentity";
import { LocalCartStorageService } from "@/shared/services/localCartStorageService";
import type { CartItem } from "@/shared/types/cart";
import type { UserI } from "@/supabase/types";

/**
 * After a return page has finalised a guest's order, take the paid lines
 * (the checkout's cart snapshot) out of their local cart. Products bagged
 * while the payment ran stay. Checkout data saved without a snapshot falls
 * back to the items selected for checkout. Registered users' carts are
 * cleaned up by the fulfillment pipeline instead.
 */
export function removePaidGuestCartItems(
  user: UserI,
  paidItems: readonly Pick<CartItem, "product_id" | "variant_id" | "quantity">[] | undefined,
): void {
  if (isRegisteredUser(user)) return;
  if (!paidItems) {
    LocalCartStorageService.removeSelectedItems();
    return;
  }
  LocalCartStorageService.removePaidItems(
    paidItems.map((item) => ({
      productId: item.product_id ?? "",
      variantId: String(item.variant_id),
      quantity: item.quantity ?? 1,
    })),
  );
}
