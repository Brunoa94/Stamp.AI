/**
 * CartOrderSummaryBreakdown
 *
 * Price breakdown for the cart summary: subtotal, shipping, tax note, and
 * the gold total. Amounts arrive in cents.
 */

import { Span } from "@/features/ui/span";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { CartOrderSummaryRow } from "./CartOrderSummaryRow";
import { CartOrderSummaryTotal } from "./CartOrderSummaryTotal";

interface CartOrderSummaryBreakdownPropsI {
  subtotal: number;
  shipping: number;
  total: number;
}

export function CartOrderSummaryBreakdown({
  subtotal,
  shipping,
  total,
}: CartOrderSummaryBreakdownPropsI) {
  return (
    <>
      <dl className="mb-8 space-y-5">
        <CartOrderSummaryRow label="Subtotal" value={formatPrice(subtotal)} />
        <CartOrderSummaryRow
          label="Shipping Protocol"
          value={shipping === 0 ? "Free" : formatPrice(shipping)}
          valueClassName="text-sm font-bold uppercase tracking-[0.15em] text-(--color-stamp-success)"
        />
        <div className="flex items-center justify-between">
          <dt>
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              Tax Logistics
            </Span>
          </dt>
          <dd>
            <Span variant="micro" className="text-(--color-stamp-taupe)/60">
              Calculated at checkout
            </Span>
          </dd>
        </div>
      </dl>

      <CartOrderSummaryTotal total={total} />
    </>
  );
}
