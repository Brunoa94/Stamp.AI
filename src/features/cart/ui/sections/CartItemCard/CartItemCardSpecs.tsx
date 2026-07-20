/**
 * CartItemCardSpecs
 *
 * Specification grid displaying variant, colorway, and line total
 * for a cart line item.
 */

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface CartItemCardSpecsPropsI {
  variantName: string;
  colorway: string;
  lineTotal: number;
}

interface SpecItemPropsI {
  label: string;
  value: string;
}

function SpecItem({ label, value }: SpecItemPropsI) {
  return (
    <div className="space-y-0.5 md:space-y-1">
      <dt>
        <Span variant="label" className="text-(--color-stamp-taupe)">
          {label}
        </Span>
      </dt>
      <dd>
        <Span variant="value">{value}</Span>
      </dd>
    </div>
  );
}

export function CartItemCardSpecs({
  variantName,
  colorway,
  lineTotal,
}: CartItemCardSpecsPropsI) {
  const t = useTranslations("cart.itemCard");

  return (
    <dl className="grid grid-cols-2 gap-3 border-t border-(--color-stamp-divider) pt-3 md:grid-cols-3 md:gap-6 md:pt-6">
      <SpecItem label={t("variant")} value={variantName} />
      <SpecItem label={t("colorway")} value={colorway} />
      <SpecItem label={t("lineTotal")} value={formatPrice(lineTotal)} />
    </dl>
  );
}
