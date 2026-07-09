/**
 * CartV2OrderSummaryBreakdown
 *
 * Price breakdown for the cart summary: subtotal, shipping, tax note, and
 * the gold total. Amounts arrive in cents.
 */

import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

interface CartV2OrderSummaryBreakdownPropsI {
  subtotal: number;
  shipping: number;
  total: number;
}

export function CartV2OrderSummaryBreakdown({
  subtotal,
  shipping,
  total,
}: CartV2OrderSummaryBreakdownPropsI) {
  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <>
      <dl className="mb-8 space-y-5">
        <div className="flex items-center justify-between">
          <dt>
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              Subtotal
            </Span>
          </dt>
          <dd className="text-sm font-bold tabular-nums">
            {formatCurrency(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              Shipping Protocol
            </Span>
          </dt>
          <dd className="text-sm font-bold uppercase tracking-[0.15em] text-(--color-stamp-success)">
            {shipping === 0 ? "Free" : formatCurrency(shipping)}
          </dd>
        </div>
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

      <div className="border-y border-(--color-stamp-divider) py-6">
        <div className="flex items-baseline justify-between">
          <Span variant="sm" className="text-(--color-stamp-chocolate)">
            Total
          </Span>
          <Heading
            as="span"
            variant="card"
            className="text-(--color-stamp-gold)"
          >
            {formatCurrency(total)}
          </Heading>
        </div>
        <Span
          variant="micro"
          className="mt-2 block text-right text-(--color-stamp-taupe)/60"
        >
          Currency: USD
        </Span>
      </div>
    </>
  );
}
