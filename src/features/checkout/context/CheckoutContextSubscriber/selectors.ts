import { useCheckoutSubscriberSelector } from "./CheckoutContextSubscriber";

export const CheckoutSelectors = {
  // Data state
  order: () => useCheckoutSubscriberSelector((state) => state.order),
  orderItems: () => useCheckoutSubscriberSelector((state) => state.orderItems),
  customProduct: () =>
    useCheckoutSubscriberSelector((state) => state.customProduct),
  isLoading: () => useCheckoutSubscriberSelector((state) => state.isLoading),
  error: () => useCheckoutSubscriberSelector((state) => state.error),

  // Customization
  customization: () => useCheckoutSubscriberSelector((state) => state.customization),

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
  subtotal: () =>
    useCheckoutSubscriberSelector((state) => state.subtotal),
  shippingCost: () =>
    useCheckoutSubscriberSelector((state) => state.shippingCost),
  discount: () =>
    useCheckoutSubscriberSelector((state) => state.discount),
  orderAmount: () => useCheckoutSubscriberSelector((state) => state.orderAmount),
  lineItems: () => useCheckoutSubscriberSelector((state) => state.lineItems)
} as const;
