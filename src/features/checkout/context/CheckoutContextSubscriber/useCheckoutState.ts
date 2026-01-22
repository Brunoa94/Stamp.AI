import { useContextSelector } from "use-context-selector";
import { CheckoutContextSubscriber } from "./CheckoutContextSubscriber";

/**
 * Select all checkout state data
 * Use this when you need order, orderItems, customProduct, loading, or error state
 *
 * @example
 * const { order, isLoading, error } = useCheckoutState();
 */
export function useCheckoutState() {
  const order = useContextSelector(CheckoutContextSubscriber, (v) => v?.order);
  const orderItems = useContextSelector(CheckoutContextSubscriber, (v) => v?.orderItems);
  const customProduct = useContextSelector(
    CheckoutContextSubscriber,
    (v) => v?.customProduct,
  );
  const isLoading = useContextSelector(CheckoutContextSubscriber, (v) => v?.isLoading);
  const error = useContextSelector(CheckoutContextSubscriber, (v) => v?.error);

  return {
    order: order!,
    orderItems: orderItems!,
    customProduct: customProduct!,
    isLoading: isLoading!,
    error: error!,
  };
}
