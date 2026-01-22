import { useContextSelector } from "use-context-selector";
import { CheckoutContext } from "./CheckoutContext";

/**
 * Select shipping-related state and handlers
 * Use this in shipping form components
 *
 * @example
 * const { shippingAddress, handleShippingSubmit } = useCheckoutShipping();
 */
export function useCheckoutShipping() {
  const shippingAddress = useContextSelector(
    CheckoutContext,
    (v) => v?.shippingAddress,
  );
  const handleShippingSubmit = useContextSelector(
    CheckoutContext,
    (v) => v?.handleShippingSubmit,
  );

  return {
    shippingAddress: shippingAddress!,
    handleShippingSubmit: handleShippingSubmit!,
  };
}
