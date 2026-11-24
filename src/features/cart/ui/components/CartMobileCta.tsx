/**
 * CartMobileCta
 *
 * Fixed bottom checkout bar shown only on small screens where the
 * sticky summary sidebar is not visible.
 */

"use client";

import { ArrowRight, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { formatPrice } from "../../lib/utils/formatPrice";

interface CartMobileCtaPropsI {
  total: number;
  onCheckout: () => void;
  canCheckout?: boolean;
  selectedCount?: number;
}

export function CartMobileCta({
  total,
  onCheckout,
  canCheckout = true,
  selectedCount,
}: CartMobileCtaPropsI) {
  const t = useTranslations("cart.mobileCta");
  const formattedTotal = formatPrice(total);

  return (
    <div
      data-cart-mobile-cta
      className="fixed inset-x-0 bottom-0 z-50 border-t border-(--color-stamp-divider) bg-(--color-stamp-white) px-4 py-3 sm:px-6 xl:hidden"
    >
      <div className="flex flex-col gap-2">
        {selectedCount !== undefined && selectedCount > 0 && (
          <Span as="p" variant="label" className="text-center text-(--color-stamp-taupe)">
            {t("itemsSelected", { count: selectedCount })}
          </Span>
        )}
        <Button
          onClick={onCheckout}
          variant="primary"
          className="group w-full"
          disabled={!canCheckout}
        >
          <Lock className="h-4 w-4" aria-hidden="true" />
          <Span unstyled>
            {canCheckout
              ? t("checkout", { total: formattedTotal })
              : t("selectItems")}
          </Span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
