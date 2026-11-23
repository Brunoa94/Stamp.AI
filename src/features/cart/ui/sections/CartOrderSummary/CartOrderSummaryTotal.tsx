/**
 * CartOrderSummaryTotal
 *
 * Total row of the cart summary, with the amount in amber text.
 */

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface CartOrderSummaryTotalPropsI {
  total: number;
}

export function CartOrderSummaryTotal({ total }: CartOrderSummaryTotalPropsI) {
  const t = useTranslations("cart.summary");

  return (
    <div className="border-y border-(--color-stamp-divider) py-5">
      <div className="flex items-baseline justify-between">
        <Span variant="sm" className="text-lg text-(--color-stamp-chocolate)">
          {t("total")}
        </Span>
        <Heading as="span" variant="price" className="text-(--color-stamp-gold-text)">
          {formatPrice(total)}
        </Heading>
      </div>
    </div>
  );
}
