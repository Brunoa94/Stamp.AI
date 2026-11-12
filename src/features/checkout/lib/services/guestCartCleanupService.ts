import { isRegisteredUser } from "@/shared/helpers/authIdentity";
import { LocalCartStorageService } from "@/shared/services/localCartStorageService";
import type { UserI } from "@/supabase/types";

/**
 * After a return page has finalised a guest's order, drop the paid items
 * (those selected for checkout) from their local cart. Registered users'
 * carts are cleaned up by the fulfillment pipeline instead.
 */
export function removePaidGuestCartItems(user: UserI): void {
  if (isRegisteredUser(user)) return;
  LocalCartStorageService.removeSelectedItems();
}
