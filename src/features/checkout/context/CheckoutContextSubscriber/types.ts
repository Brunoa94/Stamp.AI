import { ShippingAddressT } from "@/schemas/checkout";
import { CartItemWithProduct, CartWithItems } from "@/types/cart";

export interface CheckoutSubscriberContextState {
  // Data state
  cart: CartWithItems | null;
  cartItems: CartItemWithProduct[];
  isLoading: boolean;
  error: Error | null;

  // Checkout flow state
  shippingAddress: ShippingAddressT | null;
  paymentStatus: "idle" | "success" | "error";
  message: string;
  testMode: boolean;
  isProcessingPayment: boolean;
  triggerPayment: boolean;

  // Computed values
  subtotal: number;
  shippingCost: number;
  discount: number;
  orderAmount: number;
}
