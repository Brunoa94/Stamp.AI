import { ShippingAddressT } from "@/schemas/checkout";
import { CartItem, CartWithItems } from "@/types/cart";
import type {
  PaymentErrorDetailsI,
  PaymentMethodT,
  PaymentSuccessDetailsI,
} from "@/types/payment";
import type { PromoCodeTypeT } from "@/types/promocode";
import type { PrintifyLineItem } from "@/types/printifyOrder";

export interface CheckoutSubscriberContextState {
  // Data state
  cart: CartWithItems | null;
  cartItems: CartItem[];
  lineItems: PrintifyLineItem[];
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
  paymentSuccessDetails: PaymentSuccessDetailsI | null;
  paymentErrorDetails: PaymentErrorDetailsI | null;
  checkoutOrderId: string | null;
  promoCode: string | null;
  promoValue: number;
  promoType: PromoCodeTypeT | null;
  promoError: string | null;

  // Computed values
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  orderAmount: number;
}
