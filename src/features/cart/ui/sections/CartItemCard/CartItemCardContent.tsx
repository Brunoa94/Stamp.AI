/**
 * CartItemCardContent
 *
 * Textual content for a cart line item: product name, unit price, and the
 * specification grid (variant, colorway, line total).
 */

import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import type { CartItem } from "@/types/cart";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { CartItemCardSpecs } from "./CartItemCardSpecs";

interface CartItemCardContentPropsI {
  item: CartItem;
}

export function CartItemCardContent({ item }: CartItemCardContentPropsI) {
  const productName =
    item.product_name || item.product?.name || "Custom Product";
  const unitPrice = item.unit_price ?? 0;
  const quantity = item.quantity ?? 1;
  const variantName = item.variant?.name || "Standard";
  const colorway = variantName.includes("/")
    ? variantName.split("/")[0].trim()
    : variantName;

  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-start justify-between gap-2 md:gap-4">
        <div className="space-y-0.5 md:space-y-1">
          <Heading
            as="h3"
            unstyled
            className="font-heading text-sm md:text-xl font-bold uppercase tracking-tight"
          >
            {productName}
          </Heading>
        </div>
        <Heading
          as="span"
          unstyled
          className="whitespace-nowrap font-heading text-base md:text-3xl font-black tracking-tight text-(--color-stamp-gold)"
        >
          {formatPrice(unitPrice)}
        </Heading>
      </div>

      <CartItemCardSpecs
        variantName={variantName}
        colorway={colorway}
        lineTotal={unitPrice * quantity}
      />
    </div>
  );
}
