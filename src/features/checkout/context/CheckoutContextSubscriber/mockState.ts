import { CheckoutSubscriberContextState } from "./types";

export const MOCK_STATE: CheckoutSubscriberContextState = {
  // Data state
  cart: null,
  cartItems: [],
  isLoading: false,
  error: null,

  // Checkout flow state
  shippingAddress: null,
  paymentStatus: "idle",
  message: "",
  testMode: false,
  isProcessingPayment: false,
  triggerPayment: false,

  // Computed values
  subtotal: 0,
  shippingCost: 0,
  discount: 0,
  total: 0,
  orderAmount: 0,
};
