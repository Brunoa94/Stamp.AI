/**
 * Cart selection helpers shared by edge functions.
 *
 * Cart items carry an `is_selected` flag set when the user proceeds to
 * checkout with only part of the cart. Any order rebuilt from a cart
 * snapshot must honour that flag, otherwise unselected products end up
 * on the order and its invoice.
 */

export interface SelectableCartItemI {
  is_selected?: boolean | null;
}

export interface PricedCartItemI {
  unit_price?: number | null;
  price?: number | null;
}

/**
 * Return only the cart items selected for checkout.
 * Items without the flag count as selected. An explicit empty selection is
 * preserved; it must never be interpreted as a request to buy every item.
 */
export function selectCheckoutCartItems<T extends SelectableCartItemI>(
  items: T[] | null | undefined,
): T[] {
  if (!items || items.length === 0) return [];

  return items.filter((item) => item.is_selected !== false);
}

/** Read current cart snapshots (`unit_price`) and older snapshots (`price`). */
export function getSnapshotItemUnitPrice(item: PricedCartItemI): number {
  return item.unit_price ?? item.price ?? 0;
}
