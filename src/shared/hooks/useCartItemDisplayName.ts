import { localizeCartItemName } from "@/shared/helpers/localizeProduct";
import { useProductText } from "@/shared/queries/productTextQueries";
import type { CartItem } from "@/shared/types/cart";

type CartItemNameSourceT = Pick<CartItem, "printify_blueprint_id" | "product_name" | "product">;

/**
 * A cart line's title in the visitor's language, looked up by blueprint.
 * Rows without a blueprint (added before it was stored) keep the stored
 * English name. The stored `product_name` itself never changes.
 */
export function useCartItemDisplayName() {
  const text = useProductText();

  return (item: CartItemNameSourceT, fallback: string) =>
    localizeCartItemName(
      text,
      item.printify_blueprint_id,
      item.product_name || item.product?.name || fallback,
    );
}
