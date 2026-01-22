import { useContextSelector } from "use-context-selector";
import { CheckoutContext } from "./CheckoutContext";

/**
 * Select all checkout state data
 * Use this when you need order, orderItems, customProduct, loading, or error state
 *
 * @example
 * const { order, isLoading, error } = useCheckoutState();
 */
export function useCheckoutState() {
  const order = useContextSelector(CheckoutContext, (v) => v?.order);
  const orderItems = useContextSelector(CheckoutContext, (v) => v?.orderItems);
  const customProduct = useContextSelector(
    CheckoutContext,
    (v) => v?.customProduct,
  );
  const isLoading = useContextSelector(CheckoutContext, (v) => v?.isLoading);
  const error = useContextSelector(CheckoutContext, (v) => v?.error);

  return {
    order: order!,
    orderItems: orderItems!,
    customProduct: customProduct!,
    isLoading: isLoading!,
    error: error!,
  };
}
