import { useCheckoutSubscriberSelector } from "./CheckoutContextSubscriber";

export const CheckoutSelectors = {
  // Data state
  cart: () => useCheckoutSubscriberSelector((state) => state.cart),
  cartItems: () => useCheckoutSubscriberSelector((state) => state.cartItems),
  isLoading: () => useCheckoutSubscriberSelector((state) => state.isLoading),
  error: () => useCheckoutSubscriberSelector((state) => state.error),

  // Checkout flow state
  shippingAddress: () =>
    useCheckoutSubscriberSelector((state) => state.shippingAddress),
  paymentStatus: () =>
    useCheckoutSubscriberSelector((state) => state.paymentStatus),
  message: () => useCheckoutSubscriberSelector((state) => state.message),
  testMode: () => useCheckoutSubscriberSelector((state) => state.testMode),
  isProcessingPayment: () =>
    useCheckoutSubscriberSelector((state) => state.isProcessingPayment),
  triggerPayment: () =>
    useCheckoutSubscriberSelector((state) => state.triggerPayment),
  selectedPaymentMethod: () =>
    useCheckoutSubscriberSelector((state) => state.selectedPaymentMethod),

  // Computed values
  subtotal: () =>
    useCheckoutSubscriberSelector((state) => state.subtotal),
  shippingCost: () =>
    useCheckoutSubscriberSelector((state) => state.shippingCost),
  discount: () =>
    useCheckoutSubscriberSelector((state) => state.discount),
  total: () =>
    useCheckoutSubscriberSelector((state) => state.total),
  orderAmount: () => useCheckoutSubscriberSelector((state) => state.orderAmount),
} as const;
