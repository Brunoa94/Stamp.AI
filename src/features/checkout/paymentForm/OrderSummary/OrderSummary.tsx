import { ProductCustomizationT, ShippingAddressT } from "@/schemas/checkout";
import { componentThemes } from "@/theme/components";
import { ProductDetails } from "./ProductDetails";
import { PromoCodeSection } from "./PromoCodeSection";
import { PriceBreakdown } from "./PriceBreakdown";
import { ShippingAddress } from "./ShippingAddress";
import { CompleteOrderButton } from "./CompleteOrderButton";
import { CheckoutSelectors } from "../../context/CheckoutContextSubscriber/selectors";
import { useCheckoutSubscriberActions } from "../../context/CheckoutContextSubscriber/actions";
import { useUser } from "@/hooks/useAuth";
import { CartItemWithProduct, CartWithItems } from "@/types/cart";
import { useErrorHandler } from "@/hooks/useErrorHandler";

const OrderSummary = () => {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const hasShippingAddress = shippingAddress?.address1 && shippingAddress?.city;
  const orderAmount = CheckoutSelectors.subtotal();
  const shippingCost = CheckoutSelectors.shippingCost();
  const discount = CheckoutSelectors.discount();
  const isProcessingPayment = CheckoutSelectors.isProcessingPayment();
  const cart = CheckoutSelectors.cart();
  const cartItems = CheckoutSelectors.cartItems();
  const { data: user } = useUser();
  const { handleError } = useErrorHandler();

  const { handleCompleteOrder: onCompleteOrder, proceedToCheckout } =
    useCheckoutSubscriberActions();

  const onEditShipping = () => {};

  const total = orderAmount + shippingCost - discount;

  const handleSubmit = async () => {
    if (!user || !cart) return;
    try {
      await proceedToCheckout.mutateAsync({ user, cart });
    } catch (e) {
      handleError(e);
    }
  };

  return (
    <aside className={componentThemes.card.base}>
      <div className="p-8">
        <header className="mb-6">
          <h2 className={componentThemes.text.subheading}>Order Summary</h2>
        </header>

        {cartItems.map((cartItem: CartItemWithProduct) => (
          <ProductDetails product={cartItem} />
        ))}
        {/* <PromoCodeSection onPromoCodeApply={onPromoCodeApply} /> */}

        <PriceBreakdown
          subtotal={orderAmount}
          shippingCost={shippingCost}
          discount={discount}
          total={total}
        />

        <ShippingAddress
          shippingAddress={
            shippingAddress || {
              first_name: "",
              last_name: "",
              email: "",
              phone: "",
              country: "US",
              region: "",
              address1: "",
              address2: "",
              city: "",
              zip: "",
            }
          }
          onEditShipping={onEditShipping}
        />

        {onCompleteOrder && (
          <CompleteOrderButton
            total={total}
            hasShippingAddress={!!hasShippingAddress}
            isProcessingPayment={isProcessingPayment}
            onCompleteOrder={onCompleteOrder}
          />
        )}
      </div>
    </aside>
  );
};

export default OrderSummary;
