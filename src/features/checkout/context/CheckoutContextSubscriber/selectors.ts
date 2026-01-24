import { useCheckoutSubscriberSelector } from "./CheckoutContextSubscriber";
import { computeCheckoutState } from "./computeState";

export const CheckoutSelectors = {
  // Data state
  order: () => useCheckoutSubscriberSelector((state) => state.order),
  orderItems: () => useCheckoutSubscriberSelector((state) => state.orderItems),
  customProduct: () =>
    useCheckoutSubscriberSelector((state) => state.customProduct),
  isLoading: () => useCheckoutSubscriberSelector((state) => state.isLoading),
  error: () => useCheckoutSubscriberSelector((state) => state.error),

  // Customization - computed on-the-fly
  customization: () =>
    useCheckoutSubscriberSelector((state) => {
      const computed = computeCheckoutState(
        state,
        state.isLoading,
        state.error,
      );
      return computed.customization || state.customization;
    }),

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

  // Computed values - computed on-the-fly
  subtotal: () =>
    useCheckoutSubscriberSelector((state) => {
      const computed = computeCheckoutState(
        state,
        state.isLoading,
        state.error,
      );
      return computed.subtotal || 0;
    }),
  shippingCost: () =>
    useCheckoutSubscriberSelector((state) => {
      const computed = computeCheckoutState(
        state,
        state.isLoading,
        state.error,
      );
      return computed.shippingCost || 0;
    }),
  discount: () =>
    useCheckoutSubscriberSelector((state) => {
      const computed = computeCheckoutState(
        state,
        state.isLoading,
        state.error,
      );
      return computed.discount || 0;
    }),
  orderAmount: () =>
    useCheckoutSubscriberSelector((state) => {
      const computed = computeCheckoutState(
        state,
        state.isLoading,
        state.error,
      );
      return computed.orderAmount || 0;
    }),
  lineItems: () =>
    useCheckoutSubscriberSelector((state) => {
      const computed = computeCheckoutState(
        state,
        state.isLoading,
        state.error,
      );
      return computed.lineItems || [];
    }),
} as const;
