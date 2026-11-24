/**
 * CartOrderSummary
 *
 * Sticky order-summary card (white rounded-xl card, slab-serif title with a
 * handwritten accent word). Composes the
 * price breakdown and footer; totals are derived via CartServiceMapper.
 */

"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import type { CartWithItems } from "@/shared/types/cart";
import { CartOrderSummaryBreakdown } from "./CartOrderSummaryBreakdown";
import { CartOrderSummaryFooter } from "./CartOrderSummaryFooter";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";

interface SelectedTotalsI {
  subtotal: number;
  shipping: number;
  total: number;
}

interface CartOrderSummaryPropsI {
  cart: CartWithItems;
  selectedTotals: SelectedTotalsI;
  selectedCount: number;
  onCheckout: () => void;
  canCheckout: boolean;
}

export function CartOrderSummary({
  cart,
  selectedTotals,
  selectedCount,
  onCheckout,
  canCheckout,
}: CartOrderSummaryPropsI) {
  const t = useTranslations("cart.summary");

  return (
    <div className="sticky top-32 rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-6 shadow-(--shadow-stamp-card) lg:p-8">
      <Heading
        as="h2"
        variant="sectionSlab"
        className="mb-6 text-(--color-stamp-chocolate)"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <Span variant="serif" className="text-(--color-stamp-gold-text)">{chunks}</Span>
          ),
        })}
      </Heading>

      {selectedCount === 0 ? (
        <Paragraph variant="xs" className="mb-6 text-(--color-stamp-taupe)">
          {t("noItemsSelected")}
        </Paragraph>
      ) : (
        <>
          <Span as="p" variant="label" className="mb-4 text-(--color-stamp-taupe)">
            {t("itemsSelected", { count: selectedCount })}
          </Span>
          <CartOrderSummaryBreakdown
            subtotal={selectedTotals.subtotal}
            shipping={selectedTotals.shipping}
            total={selectedTotals.total}
          />
        </>
      )}
      <CartOrderSummaryFooter onCheckout={onCheckout} canCheckout={canCheckout} />
    </div>
  );
}
