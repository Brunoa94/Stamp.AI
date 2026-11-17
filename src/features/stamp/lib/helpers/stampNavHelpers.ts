import {
  STAMP_CART_BADGE_MAX,
  STAMP_NAV_ITEMS,
} from "@/features/stamp/lib/constants/stampNav";
import type { StampNavItemT } from "@/features/stamp/lib/types/stampNavTypes";

/** Header links the current visitor can use; account links need a registered user. */
export function getStampNavItems(isRegistered: boolean): StampNavItemT[] {
  return STAMP_NAV_ITEMS.filter((item) => isRegistered || !item.registeredOnly);
}

/** Whether `pathname` is the link's route or one nested under it. */
export function isStampNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Bag badge text, or `null` when the bag is empty and the badge is hidden. */
export function formatCartBadgeCount(count: number): string | null {
  if (count <= 0) return null;
  return count > STAMP_CART_BADGE_MAX ? `${STAMP_CART_BADGE_MAX}+` : String(count);
}
