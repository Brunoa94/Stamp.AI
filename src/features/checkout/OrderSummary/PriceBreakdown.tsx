import { CheckoutSelectors } from "../context/CheckoutContextSubscriber/selectors";

export const PriceBreakdown = () => {
  const subtotal = CheckoutSelectors.subtotal();
  const shippingCost = CheckoutSelectors.shippingCost();
  const discount = CheckoutSelectors.discount();
  const total = subtotal + shippingCost - discount;

  return (
    <div className="space-y-3 mb-6 pb-6 border-b border-slate-100">
      <div className="flex justify-between items-center text-sm font-medium text-slate-600">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center text-sm font-medium text-slate-600">
        <span>Shipping</span>
        <span
          className={
            shippingCost === 0
              ? "text-green-600 uppercase font-bold text-xs"
              : ""
          }
        >
          {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
        </span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between items-center text-green-600 font-medium">
          <span>Discount</span>
          <span>-${discount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between items-end pt-4 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Total Amount
          </span>
          <span className="text-3xl font-heading font-extrabold text-slate-900 leading-none">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
