/**
 * CheckoutPriceBreakdown
 *
 * Price breakdown for the checkout summary, matching the cart summary's rows
 * (taupe labels, chocolate amounts, amber total).
 * Values arrive already computed (in dollars) from useCheckoutPricing.
 */

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { Heading } from "@/features/ui/heading";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface CheckoutPriceBreakdownPropsI {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <Span variant="value" className="text-(--color-stamp-taupe)">
        {label}
      </Span>
      <Span
        unstyled
        className="font-body text-base font-bold tabular-nums text-(--color-stamp-chocolate)"
      >
        {value}
      </Span>
    </div>
  );
}

export function CheckoutPriceBreakdown({
  subtotal,
  shipping,
  discount,
  total,
}: CheckoutPriceBreakdownPropsI) {
  const t = useTranslations("checkout.priceBreakdown");
  return (
    <div className="space-y-4">
      <Row label={t("subtotal")} value={formatPrice(subtotal)} />

      <div className="flex items-center justify-between">
        <Span variant="value" className="text-(--color-stamp-taupe)">
          {t("shipping")}
        </Span>
        <Span
          unstyled
          className={`font-body text-base font-bold tabular-nums ${
            shipping === 0
              ? "text-(--color-stamp-success)"
              : "text-(--color-stamp-chocolate)"
          }`}
        >
          {shipping === 0 ? t("free") : formatPrice(shipping)}
        </Span>
      </div>

      {discount > 0 && (
        <div className="flex items-center justify-between">
          <Span variant="value" className="text-(--color-stamp-taupe)">
            {t("discount")}
          </Span>
          <Span
            unstyled
            className="font-body text-base font-bold tabular-nums text-(--color-stamp-success)"
          >
            −{formatPrice(discount)}
          </Span>
        </div>
      )}

      <div className="flex items-baseline justify-between border-t border-(--color-stamp-divider) pt-5">
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
