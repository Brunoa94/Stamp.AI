/**
 * CartOrderSummary
 *
 * Sticky order-summary panel in the luxury brutalist style. Composes the
 * price breakdown and footer; totals are derived via CartServiceMapper.
 */

"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import type { CartWithItems } from "@/types/cart";
import { CartServiceMapper } from "@/mappers/services/cartServiceMapper";
import { CartOrderSummaryBreakdown } from "./CartOrderSummaryBreakdown";
import { CartOrderSummaryFooter } from "./CartOrderSummaryFooter";

interface CartOrderSummaryPropsI {
  cart: CartWithItems;
  onCheckout: () => void;
}

export function CartOrderSummary({ cart, onCheckout }: CartOrderSummaryPropsI) {
  const t = useTranslations("cart.summary");
  const { subtotal, shipping } = CartServiceMapper.calculateCartTotals(
    cart.cart_items,
  );
  const total = subtotal + shipping;

  return (
    <div className="sticky top-8 border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 lg:p-10">
      <Heading
        as="h2"
        unstyled
        className="mb-8 font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <span className="text-(--color-stamp-gold)">{chunks}</span>
          ),
        })}
      </Heading>

      <CartOrderSummaryBreakdown
        subtotal={subtotal}
        shipping={shipping}
        total={total}
      />
      <CartOrderSummaryFooter onCheckout={onCheckout} />
    </div>
  );
}
