import type { AddToCartInput, CartItem, CartWithItems } from "@/shared/types/cart";
import type { LocalCartItemT } from "@/shared/services/localCartStorageService";

/** Cart id of a guest's local cart. It never exists in the database. */
export const LOCAL_CART_ID = "local-cart";

export function isLocalCart(cart: Pick<CartWithItems, "id"> | null | undefined): boolean {
  return cart?.id === LOCAL_CART_ID;
}

function mapLocalCartItemToCartItem(item: LocalCartItemT): CartItem {
  return {
    id: item.id,
    cart_id: LOCAL_CART_ID,
    product_id: item.productId,
    product_name: item.productName,
    variant_id: item.variantId,
    variant_name: null,
    unit_price: item.unitPrice,
    selling_price: null,
    quantity: item.quantity,
    custom_image_url: item.customImageUrl,
    custom_image_hash: null,
    custom_image_public_id: null,
    printify_blueprint_id: item.blueprintId,
    printify_print_provider_id: item.printProviderId,
    is_selected: item.isSelected,
    created_at: null,
    updated_at: null,
  };
}

/** A guest's local cart in the shape the cart and checkout UI already render. */
export function mapLocalCartToCartWithItems(items: LocalCartItemT[]): CartWithItems {
  return {
    id: LOCAL_CART_ID,
    user_id: null,
    session_id: null,
    status: "active",
    user_email: null,
    created_at: null,
    updated_at: null,
    cart_items: items.map(mapLocalCartItemToCartItem),
  };
}

/** The payload `upsert_cart_item` needs to copy a local item into a database cart. */
export function mapLocalCartItemToAddToCartInput(item: LocalCartItemT): AddToCartInput {
  return {
    product_id: item.productId,
    variant_id: item.variantId,
    product_name: item.productName,
    unit_price: item.unitPrice,
    quantity: item.quantity,
    custom_image_url: item.customImageUrl,
  };
}
