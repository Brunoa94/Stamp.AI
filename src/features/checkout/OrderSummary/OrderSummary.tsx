import { ProductDetails } from "./ProductDetails";
import { PriceBreakdown } from "./PriceBreakdown";
import { ShippingAddress } from "./ShippingAddress";
import { CompleteOrderButton } from "./CompleteOrderButton";
import { CheckoutSelectors } from "../context/CheckoutContextSubscriber/selectors";
import { useCheckoutSubscriberActions } from "../context/CheckoutContextSubscriber/actions";
import { CartItem } from "@/types/cart";

const OrderSummary = () => {
  const cartItems = CheckoutSelectors.cartItems();

  const { handleCompleteOrder: onCompleteOrder } =
    useCheckoutSubscriberActions();

  const onEditShipping = () => {};

  return (
    <aside className="glass-card p-8 rounded-none">
      <header className="mb-6">
        <h2 className="text-xl font-heading font-bold uppercase tracking-tight text-slate-900">
          Order Summary
        </h2>
      </header>

      {cartItems.map((cartItem: CartItem) => (
        <ProductDetails
          key={`${cartItem.cart_id}-${cartItem.created_at}`}
          product={cartItem}
        />
      ))}
      {/* <PromoCodeSection onPromoCodeApply={onPromoCodeApply} /> */}

      <PriceBreakdown />

      <ShippingAddress onEditShipping={onEditShipping} />

      {onCompleteOrder && (
        <CompleteOrderButton onCompleteOrder={onCompleteOrder} />
      )}
    </aside>
  );
};

export default OrderSummary;
