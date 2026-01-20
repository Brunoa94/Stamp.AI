import { ProductCustomizationT, ShippingAddressT } from "@/schemas/checkout";
import { componentThemes } from "@/theme/components";
import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import clsx from "clsx";
import { useState } from "react";
import Image from "next/image";

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
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  // Calculate totals
  const subtotal = orderAmount;
  const total = subtotal + shippingCost - discount;

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setPromoApplied(true);
      onPromoCodeApply?.(promoCode);
      // TODO: Implement promo code validation and discount calculation
    }
  };

  return (
    <aside className={componentThemes.card.base}>
      <div className="p-8">
        <header className="mb-6">
          <h2 className={componentThemes.text.subheading}>Order Summary</h2>
        </header>

        {/* Product Details */}
        <article className="flex items-start gap-4 mb-6 pb-6 border-b border-purple-100">
          {customization.preview_url && (
            <figure className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-purple-200">
              <Image
                src={customization.preview_url}
                alt="Product design preview"
                fill
                className="object-contain"
              />
            </figure>
          )}
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{customization.product_title}</p>
            <p className={componentThemes.text.caption}>{customization.variant_title}</p>
            <p className={componentThemes.text.caption}>Qty: {customization.quantity}</p>
          </div>
          <p className="font-semibold text-gray-900">${subtotal.toFixed(2)}</p>
        </article>

        {/* Promo Code Section */}
        <div className="mb-6 pb-6 border-b border-purple-100">
          <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-2">
            Promo Code
          </label>
          <div className="flex gap-2">
            <Input
              id="promo-code"
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              disabled={promoApplied}
              className={clsx(componentThemes.input.base, "flex-1")}
            />
            <Button
              type="button"
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || promoApplied}
              className={clsx(
                "px-4 py-2 text-sm font-medium",
                promoApplied
                  ? "bg-green-100 text-green-700 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              )}
            >
              {promoApplied ? "Applied" : "Apply"}
            </Button>
          </div>
          {promoApplied && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <span>✓</span>
              <span>Promo code applied (feature coming soon)</span>
            </p>
          )}
        </div>

        {/* Price Breakdown */}
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

        {hasShippingAddress && (
          <div className="pt-6 pb-6 border-b border-purple-100">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900">Shipping To</h3>
              <button
                onClick={onEditShipping}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Edit
              </button>
            </div>
            <address className="text-sm text-gray-600 not-italic space-y-1">
              <p className="font-medium text-gray-900">
                {shippingAddress.first_name} {shippingAddress.last_name}
              </p>
              <p>{shippingAddress.address1}</p>
              {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
              <p>
                {shippingAddress.city}
                {shippingAddress.region && `, ${shippingAddress.region}`}{" "}
                {shippingAddress.zip}
              </p>
              <p>{shippingAddress.email}</p>
            </address>
          </div>
        )}

        {/* Complete Order Button */}
        {onCompleteOrder && (
          <div className="pt-6">
            <Button
              onClick={onCompleteOrder}
              disabled={!hasShippingAddress || isProcessingPayment}
              className={clsx(
                componentThemes.button.primary,
                "w-full py-4 text-lg font-semibold",
                {
                  "opacity-50 cursor-not-allowed": !hasShippingAddress || isProcessingPayment,
                }
              )}
            >
              {isProcessingPayment ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                <>Complete Order - ${total.toFixed(2)}</>
              )}
            </Button>
            {!hasShippingAddress && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Please complete shipping address first
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default OrderSummary;
