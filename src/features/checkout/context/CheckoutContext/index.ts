// Main provider
export { CheckoutProvider } from "./CheckoutContext";

// Types
export type { CheckoutContextValue, Order, OrderItem } from "./types";

// Combined hook (use sparingly - causes more re-renders)
export { useCheckout } from "./useCheckout";

// Optimized selector hooks (preferred for better performance)
export { useCheckoutState } from "./useCheckoutState";
export { useCheckoutCustomization } from "./useCheckoutCustomization";
export { useCheckoutPayment } from "./useCheckoutPayment";
export { useCheckoutShipping } from "./useCheckoutShipping";
export { useCheckoutActions } from "./useCheckoutActions";
export { useCheckoutAmounts } from "./useCheckoutAmounts";
