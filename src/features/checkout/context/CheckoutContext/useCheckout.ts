import { useCheckoutState } from "./useCheckoutState";
import { useCheckoutCustomization } from "./useCheckoutCustomization";
import { useCheckoutPayment } from "./useCheckoutPayment";
import { useCheckoutShipping } from "./useCheckoutShipping";
import { useCheckoutActions } from "./useCheckoutActions";
import { useCheckoutAmounts } from "./useCheckoutAmounts";

/**
 * Convenience hook that combines all checkout selectors
 * Use this when you need access to multiple parts of the checkout state
 *
 * WARNING: This hook will cause re-renders when ANY part of the checkout state changes.
 * For better performance, use specific selector hooks instead:
 * - useCheckoutState() - for order data and loading
 * - useCheckoutCustomization() - for product customization
 * - useCheckoutPayment() - for payment state and handlers
 * - useCheckoutShipping() - for shipping address
 * - useCheckoutActions() - for navigation actions
 * - useCheckoutAmounts() - for price calculations
 *
 * @example
 * const { isLoading, customization, handlePaymentSuccess } = useCheckout();
 */
export function useCheckout() {
  const state = useCheckoutState();
  const customization = useCheckoutCustomization();
  const payment = useCheckoutPayment();
  const shipping = useCheckoutShipping();
  const actions = useCheckoutActions();
  const amounts = useCheckoutAmounts();

  return {
    ...state,
    customization,
    ...payment,
    ...shipping,
    ...actions,
    ...amounts,
  };
}
