/**
 * CartOrderSummaryTotal
 *
 * Total section with gold-highlighted price and currency note.
 */

import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface CartOrderSummaryTotalPropsI {
  total: number;
}

export function CartOrderSummaryTotal({ total }: CartOrderSummaryTotalPropsI) {
  return (
    <div className="border-y border-(--color-stamp-divider) py-6">
      <div className="flex items-baseline justify-between">
        <Span variant="sm" className="text-xl font-bold text-(--color-stamp-chocolate)">
          Total
        </Span>
        <Heading as="span" unstyled className="font-body text-2xl md:text-3xl font-bold text-(--color-stamp-gold)">
          {formatPrice(total)}
        </Heading>
      </div>
    </div>
  );
}
