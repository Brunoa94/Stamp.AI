/**
 * CartItemCardSpecs
 *
 * Specification grid displaying variant, colorway, and line total
 * for a cart line item.
 */

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
    <div className="space-y-1">
      <dt>
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {label}
        </Span>
      </dt>
      <dd>
        <Span unstyled className="text-lg font-bold uppercase tracking-[0.15em]">
          {value}
        </Span>
      </dd>
    </div>
  );
}

export function CartItemCardSpecs({
  variantName,
  colorway,
  lineTotal,
}: CartItemCardSpecsPropsI) {
  return (
    <dl className="grid grid-cols-2 gap-6 border-t border-(--color-stamp-divider) pt-6 md:grid-cols-3">
      <SpecItem label="Variant" value={variantName} />
      <SpecItem label="Colorway" value={colorway} />
      <SpecItem label="Line Total" value={formatPrice(lineTotal)} />
    </dl>
  );
}
