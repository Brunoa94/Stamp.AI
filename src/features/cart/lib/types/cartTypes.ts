/**
 * Cart feature-specific types
 *
 * Note: Shared cart types (CartWithItems, CartItemT, etc.) are in @/types/cart
 * These types are specific to the cart feature UI and behavior
 */

export type CartItemUpdateType = {
  itemId: string;
  quantity: number;
}

export type CartSummaryDataType = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}
