/**
 * CartMobileCta
 *
 * Fixed bottom checkout bar shown only on small screens where the
 * sticky summary sidebar is not visible.
 */

"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { formatPrice } from "../../lib/utils/formatPrice";

interface CartMobileCtaPropsI {
  total: number;
  onCheckout: () => void;
}

export function CartMobileCta({ total, onCheckout }: CartMobileCtaPropsI) {
  const formattedTotal = formatPrice(total);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-(--color-stamp-divider) bg-(--color-stamp-white) p-4 xl:hidden">
      <Button
        onClick={onCheckout}
        variant="secondary-brown"
        className="group w-full font-heading"
      >
        <span>Checkout · {formattedTotal}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
}
