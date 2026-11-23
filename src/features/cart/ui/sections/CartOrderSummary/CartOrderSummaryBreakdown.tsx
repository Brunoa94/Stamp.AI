/**
 * CartOrderSummaryBreakdown
 *
 * Price breakdown for the cart summary: subtotal, shipping, tax note, and
 * the gold total. Amounts arrive in cents.
 */

import { useTranslations } from "next-intl";
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
      <dl className="mb-6 space-y-4">
        <CartOrderSummaryRow
          label={t("subtotal")}
          value={formatPrice(subtotal)}
        />
        <CartOrderSummaryRow
          label={t("shippingProtocol")}
          value={shipping === 0 ? t("free") : formatPrice(shipping)}
          valueClassName="font-body text-base font-bold text-(--color-stamp-success)"
        />
      </dl>

      <CartOrderSummaryTotal total={total} />
    </>
  );
}
