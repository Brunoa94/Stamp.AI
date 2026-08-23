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
import { CartOrderSummaryBreakdown } from "./CartOrderSummaryBreakdown";
import { CartOrderSummaryFooter } from "./CartOrderSummaryFooter";

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
    <div className="sticky top-32 border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 lg:p-10">
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

      {selectedCount === 0 ? (
        <p className="mb-8 text-sm text-(--color-stamp-taupe)">
          {t("noItemsSelected")}
        </p>
      ) : (
        <>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-(--color-stamp-taupe)">
            {t("itemsSelected", { count: selectedCount })}
          </p>
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
