/**
 * CheckoutV2PriceBreakdown
 *
 * Price breakdown for the checkout summary, restyled to the luxury system.
 * Values arrive already computed (in dollars) from useCheckoutPricing.
 */

import { Span } from "@/features/ui/span";
import { Heading } from "@/features/ui/heading";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface CheckoutV2PriceBreakdownPropsI {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <Span variant="micro" className="text-(--color-stamp-taupe)">
        {label}
      </Span>
      <Span
        unstyled
        className="text-sm font-bold tabular-nums text-(--color-stamp-chocolate)"
      >
        {value}
      </Span>
    </div>
  );
}

export function CheckoutV2PriceBreakdown({
  subtotal,
  shipping,
  discount,
  total,
}: CheckoutV2PriceBreakdownPropsI) {
  return (
    <div className="space-y-5">
      <Row label="Subtotal" value={formatPrice(subtotal)} />

      <div className="flex items-center justify-between">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          Shipping
        </Span>
        <Span
          unstyled
          className="text-sm font-bold uppercase tracking-[0.15em] text-(--color-stamp-success)"
        >
          {shipping === 0 ? "Free" : formatPrice(shipping)}
        </Span>
      </div>

      {discount > 0 && (
        <div className="flex items-center justify-between">
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            Discount
          </Span>
          <Span
            unstyled
            className="text-sm font-bold tabular-nums text-(--color-stamp-success)"
          >
            −{formatPrice(discount)}
          </Span>
        </div>
      )}

      <div className="flex items-baseline justify-between border-t border-(--color-stamp-divider) pt-5">
        <Span variant="sm" className="text-(--color-stamp-chocolate)">
          Total
        </Span>
        <Heading as="span" variant="card" className="text-(--color-stamp-gold)">
          {formatPrice(total)}
        </Heading>
      </div>
    </div>
  );
}
