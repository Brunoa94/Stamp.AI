import type { Database } from "@/types/database.types";
import type { CartItem, CartWithItems, CartSummary, AddToCartInput } from "@/types/cart";

type CartRow = Database['public']['Tables']['carts']['Row'];
type CartItemRow = Database['public']['Tables']['cart_items']['Row'];
type CartItemInsert = Database['public']['Tables']['cart_items']['Insert'];

export class CartServiceMapper {
  /**
   * Map database cart row to CartWithItems
   */
  static mapCartRowToCartWithItems(
    cart: CartRow,
    items: CartItem[]
  ): CartWithItems {
    return {
      ...cart,
      cart_items: items,
    };
  }

  /**
   * Map cart items to cart summary
   */
  static mapItemsToCartSummary(items: CartItem[]): CartSummary {
    const subtotal = items.reduce((sum, item) => {
      return sum + ((item.unit_price ?? 0) * (item.quantity ?? 1));
    }, 0);

    const itemCount = items.reduce((count, item) => {
      return count + (item.quantity ?? 1);
    }, 0);

    return {
      subtotal,
      itemCount,
      items,
    };
  }

  /**
   * Map database cart item row with relations to CartItem
   */
  static mapCartItemRowToCartItem(
    item: CartItemRow,
    product?: any,
    variant?: any
  ): CartItem {
    return {
      ...item,
      product: product || undefined,
      variant: variant || undefined,
    };
  }

  /**
   * Calculate item total price
   */
  static calculateItemTotal(item: CartItem): number {
    return (item.unit_price ?? 0) * (item.quantity ?? 1);
  }

  /**
   * Calculate cart totals
   */
  static calculateCartTotals(items: CartItem[]) {
    const subtotal = items.reduce((sum, item) => {
      return sum + this.calculateItemTotal(item);
    }, 0);

    const itemCount = items.reduce((count, item) => {
      return count + (item.quantity ?? 1);
    }, 0);

    // Future: Add tax and shipping calculations here
    const tax = 0;
    const shipping = 0;
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      total,
      itemCount,
    };
  }

  /**
   * Map AddToCartInput to database insert format
   */
  static mapAddToCartInputToInsert(
    cartId: string,
    input: AddToCartInput
  ): CartItemInsert {
    return {
      cart_id: cartId,
      product_id: input.product_id ?? null,
      product_name: input.product_name,
      variant_id: input.variant_id ?? null,
      quantity: input.quantity,
      unit_price: input.unit_price,
      custom_image_url: input.custom_image_url ?? null,
    };
  }

  /**
   * Map CartItemRow to AddToCartInput (for cart merging)
   */
  static mapCartItemRowToAddToCartInput(item: CartItemRow): AddToCartInput {
    return {
      product_id: item.product_id ?? undefined,
      product_name: item.product_name,
      variant_id: item.variant_id ?? undefined,
      quantity: item.quantity ?? 1,
      unit_price: item.unit_price ?? 0,
      custom_image_url: item.custom_image_url ?? undefined,
    };
  }

  /**
   * Map update quantity to database update format
   */
  static mapQuantityUpdate(quantity: number): { quantity: number } {
    return { quantity };
  }
}
