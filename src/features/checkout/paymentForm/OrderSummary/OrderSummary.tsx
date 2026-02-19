import { componentThemes } from "@/theme/components";
import { ProductDetails } from "./ProductDetails";
import { PriceBreakdown } from "./PriceBreakdown";
import { ShippingAddress } from "./ShippingAddress";
import { CompleteOrderButton } from "./CompleteOrderButton";
import { CheckoutSelectors } from "../../context/CheckoutContextSubscriber/selectors";
import { useCheckoutSubscriberActions } from "../../context/CheckoutContextSubscriber/actions";
import { CartItem } from "@/types/cart";

const OrderSummary = () => {
  const cartItems = CheckoutSelectors.cartItems();

  const { handleCompleteOrder: onCompleteOrder } =
    useCheckoutSubscriberActions();

  const onEditShipping = () => {};

  return (
    <aside className={componentThemes.card.base}>
      <div className="p-8">
        <header className="mb-6">
          <h2 className={componentThemes.text.subheading}>Order Summary</h2>
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
      </div>
    </aside>
  );
};

export default OrderSummary;
