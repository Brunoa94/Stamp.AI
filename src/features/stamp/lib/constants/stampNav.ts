import type { StampNavItemT } from "@/features/stamp/lib/types/stampNavTypes";

/** Text links in the Stamp header, in display order. */
export const STAMP_NAV_ITEMS: readonly StampNavItemT[] = [
  { href: "/catalog", labelKey: "catalog", registeredOnly: false },
  { href: "/faq", labelKey: "faq", registeredOnly: false },
  { href: "/orders", labelKey: "orders", registeredOnly: true },
];

/** Bag counts above this show as "9+" so the badge keeps its size. */
export const STAMP_CART_BADGE_MAX = 9;
