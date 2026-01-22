import { useContextSelector } from "use-context-selector";
import { CheckoutContext } from "./CheckoutContext";

/**
 * Select customization data
 * Use this when you need product customization details
 *
 * @example
 * const customization = useCheckoutCustomization();
 * console.log(customization.product_id, customization.variant_id);
 */
export function useCheckoutCustomization() {
  const customization = useContextSelector(
    CheckoutContext,
    (v) => v?.customization,
  );
  return customization!;
}
