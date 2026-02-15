import { ProductCustomizationT, ShippingAddressT } from "@/schemas/checkout";
import { componentThemes } from "@/theme/components";
import { ProductDetails } from "./ProductDetails";
import { PromoCodeSection } from "./PromoCodeSection";
import { PriceBreakdown } from "./PriceBreakdown";
import { ShippingAddress } from "./ShippingAddress";
import { CompleteOrderButton } from "./CompleteOrderButton";

interface Props {
  customization: ProductCustomizationT;
  shippingAddress: ShippingAddressT;
  orderAmount: number;
  shippingCost?: number;
  discount?: number;
  onEditShipping: () => void;
  onCompleteOrder?: () => void;
  isProcessingPayment?: boolean;
  onPromoCodeApply?: (code: string) => void;
}

const OrderSummary = ({
  customization,
  shippingAddress,
  orderAmount,
  shippingCost = 5.99,
  discount = 0,
  onEditShipping,
  onCompleteOrder,
  isProcessingPayment = false,
  onPromoCodeApply,
}: Props) => {
  const hasShippingAddress = shippingAddress.address1 && shippingAddress.city;

  // Calculate totals
  const subtotal = orderAmount;
  const total = subtotal + shippingCost - discount;

  return (
    <aside className={componentThemes.card.base}>
      <div className="p-8">
        <header className="mb-6">
          <h2 className={componentThemes.text.subheading}>Order Summary</h2>
        </header>

        <ProductDetails customization={customization} subtotal={subtotal} />

        <PromoCodeSection onPromoCodeApply={onPromoCodeApply} />

        <PriceBreakdown
          subtotal={subtotal}
          shippingCost={shippingCost}
          discount={discount}
          total={total}
        />

        <ShippingAddress
          shippingAddress={shippingAddress}
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
