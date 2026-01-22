import { useContextSelector } from "use-context-selector";
import { CheckoutContext } from "./CheckoutContext";

/**
 * Select action handlers for checkout flow navigation
 * Use this in success/error screens
 *
 * @example
 * const { handleCreateAnother, handleTryAgain } = useCheckoutActions();
 */
export function useCheckoutActions() {
  const handleCreateAnother = useContextSelector(
    CheckoutContext,
    (v) => v?.handleCreateAnother,
  );
  const handleTryAgain = useContextSelector(
    CheckoutContext,
    (v) => v?.handleTryAgain,
  );

  return {
    handleCreateAnother: handleCreateAnother!,
    handleTryAgain: handleTryAgain!,
  };
}
