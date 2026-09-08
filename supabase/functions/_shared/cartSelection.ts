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

/**
 * Return only the cart items selected for checkout.
 * Items without the flag count as selected; when nothing is selected every
 * item is returned so legacy snapshots keep working.
 */
export function selectCheckoutCartItems<T extends SelectableCartItemI>(
  items: T[] | null | undefined,
): T[] {
  if (!items || items.length === 0) return [];

  const selected = items.filter((item) => item.is_selected !== false);
  return selected.length > 0 ? selected : items;
}
