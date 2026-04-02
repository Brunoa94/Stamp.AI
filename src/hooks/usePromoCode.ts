import { useCheckoutSubscriberActions } from "@/features/checkout/context/CheckoutContextSubscriber/actions";
import { CheckoutSelectors } from "@/features/checkout/context/CheckoutContextSubscriber/selectors";

export function usePromoCode() {
  const promoCode = CheckoutSelectors.promoCode();
  const promoError = CheckoutSelectors.promoError();
  const discount = CheckoutSelectors.discount();

  const { handleApplyPromoCode, handleClearPromoCode } =
    useCheckoutSubscriberActions();

  return {
    promoCode,
    promoError,
    discount,
    applyPromoCode: handleApplyPromoCode,
    clearPromoCode: handleClearPromoCode,
  };
}
