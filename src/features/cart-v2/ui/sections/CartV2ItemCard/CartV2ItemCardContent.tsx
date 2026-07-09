/**
 * CartV2ItemCardContent
 *
 * Textual content for a cart line item: product name, unit price, and the
 * specification grid (variant, colorway, line total).
 */

import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import type { CartItem } from "@/types/cart";

interface CartV2ItemCardContentPropsI {
  item: CartItem;
}

export function CartV2ItemCardContent({ item }: CartV2ItemCardContentPropsI) {
  const productName =
    item.product_name || item.product?.name || "Custom Product";
  const unitPrice = item.unit_price ?? 0;
  const variantName = item.variant?.name || "Standard";
  const colorway = variantName.includes("/")
    ? variantName.split("/")[0].trim()
    : variantName;

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Heading as="h3" variant="item">
            {productName}
          </Heading>
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            Custom Design Synthesis
          </Span>
        </div>
        <Heading
          as="span"
          variant="card"
          className="whitespace-nowrap text-(--color-stamp-gold)"
        >
          {formatCurrency(unitPrice)}
        </Heading>
      </div>

      <dl className="grid grid-cols-2 gap-6 border-t border-(--color-stamp-divider) pt-6 md:grid-cols-3">
        <div className="space-y-1">
          <dt>
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              Variant
            </Span>
          </dt>
          <dd className="text-xs font-bold uppercase tracking-[0.15em]">
            {variantName}
          </dd>
        </div>
        <div className="space-y-1">
          <dt>
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              Colorway
            </Span>
          </dt>
          <dd className="text-xs font-bold uppercase tracking-[0.15em]">
            {colorway}
          </dd>
        </div>
        <div className="space-y-1">
          <dt>
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              Line Total
            </Span>
          </dt>
          <dd className="text-xs font-bold uppercase tracking-[0.15em]">
            {formatCurrency(unitPrice * item.quantity)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
