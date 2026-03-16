import { ShippingAddressT } from "@/schemas/checkout";
import { CartItem, CartWithItems } from "@/types/cart";
import type { PaymentMethodT } from "@/types/payment";

export interface CheckoutSubscriberContextState {
  // Data state
  cart: CartWithItems | null;
  cartItems: CartItem[];
  isLoading: boolean;
  error: Error | null;

  // Checkout flow state
  shippingAddress: ShippingAddressT | null;
  paymentStatus: "idle" | "success" | "error";
  message: string;
  testMode: boolean;
  isProcessingPayment: boolean;
  triggerPayment: boolean;
  selectedPaymentMethod: PaymentMethodT;

  // Computed values
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  orderAmount: number;
}
