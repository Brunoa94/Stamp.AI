import { componentThemes } from "@/theme/components";
import { CheckoutSelectors } from "../../context/CheckoutContextSubscriber/selectors";

export const PriceBreakdown = () => {
  const subtotal = CheckoutSelectors.subtotal();
  const shippingCost = CheckoutSelectors.shippingCost();
  const discount = CheckoutSelectors.discount();
  const total = subtotal + shippingCost - discount;

  return (
    <div className="space-y-3 mb-6 pb-6 border-b border-purple-100">
      <div className="flex justify-between items-center text-gray-600">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center text-gray-600">
        <span>Shipping</span>
        <span>${shippingCost.toFixed(2)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between items-center text-green-600 font-medium">
          <span>Discount</span>
          <span>-${discount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between items-center pt-3 border-t border-purple-100">
        <span className="text-lg font-semibold text-gray-900">Total</span>
        <span className={`${componentThemes.text.heading} text-2xl`}>
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
