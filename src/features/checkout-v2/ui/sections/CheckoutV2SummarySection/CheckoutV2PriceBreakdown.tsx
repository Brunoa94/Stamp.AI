/**
 * CheckoutV2PriceBreakdown
 *
 * Price breakdown for the checkout summary, restyled to the luxury system.
 * Values arrive already computed (in dollars) from useCheckoutPricing.
 */

import { Span } from "@/features/ui/span";
import { Heading } from "@/features/ui/heading";

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
      <span className="text-sm font-bold tabular-nums text-(--color-stamp-chocolate)">
        {value}
      </span>
    </div>
  );
}

export function CheckoutV2PriceBreakdown({
  subtotal,
  shipping,
  discount,
  total,
}: CheckoutV2PriceBreakdownPropsI) {
  const money = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="space-y-5">
      <Row label="Subtotal" value={money(subtotal)} />

      <div className="flex items-center justify-between">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          Shipping
        </Span>
        <span className="text-sm font-bold uppercase tracking-[0.15em] text-(--color-stamp-success)">
          {shipping === 0 ? "Free" : money(shipping)}
        </span>
      </div>

      {discount > 0 && (
        <div className="flex items-center justify-between">
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            Discount
          </Span>
          <span className="text-sm font-bold tabular-nums text-(--color-stamp-success)">
            −{money(discount)}
          </span>
        </div>
      )}

      <div className="flex items-baseline justify-between border-t border-(--color-stamp-divider) pt-5">
        <Span variant="sm" className="text-(--color-stamp-chocolate)">
          Total
        </Span>
        <Heading as="span" variant="card" className="text-(--color-stamp-gold)">
          {money(total)}
        </Heading>
      </div>
    </div>
  );
}
