/**
 * CartOrderSummaryBreakdown
 *
 * Price breakdown for the cart summary: subtotal, shipping, tax note, and
 * the gold total. Amounts arrive in cents.
 */

import { useTranslations } from "next-intl";
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
  const t = useTranslations("cart.summary");

  return (
    <>
      <dl className="mb-8 space-y-5">
        <CartOrderSummaryRow
          label={t("subtotal")}
          value={formatPrice(subtotal)}
        />
        <CartOrderSummaryRow
          label={t("shippingProtocol")}
          value={shipping === 0 ? t("free") : formatPrice(shipping)}
          valueClassName="font-body text-base font-bold uppercase tracking-[0.15em] text-(--color-stamp-success)"
        />
      </dl>

      <CartOrderSummaryTotal total={total} />
    </>
  );
}
