/**
 * CartOrderSummaryTotal
 *
 * Total section with gold-highlighted price and currency note.
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
    <div className="border-y border-(--color-stamp-divider) py-6">
      <div className="flex items-baseline justify-between">
        <Span variant="sm" className="text-(--color-stamp-chocolate)">
          {t("total")}
        </Span>
        <Heading
          as="span"
          unstyled
          className="font-heading text-2xl md:text-3xl font-black uppercase tracking-tight text-(--color-stamp-gold)"
        >
          {formatPrice(total)}
        </Heading>
      </div>
      <Span
        variant="micro"
        className="mt-2 block text-right text-(--color-stamp-taupe)/60"
      >
        {t("currencyNote")}
      </Span>
    </div>
  );
}
