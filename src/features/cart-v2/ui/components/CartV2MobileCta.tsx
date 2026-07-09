/**
 * CartV2MobileCta
 *
 * Fixed bottom checkout bar shown only on small screens where the
 * sticky summary sidebar is not visible.
 */

"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";

interface CartV2MobileCtaPropsI {
  total: number;
  onCheckout: () => void;
}

export function CartV2MobileCta({ total, onCheckout }: CartV2MobileCtaPropsI) {
  const formattedTotal = `$${(total / 100).toFixed(2)}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-(--color-stamp-divider) bg-(--color-stamp-white) p-4 xl:hidden">
      <Button
        onClick={onCheckout}
        variant="secondary-brown"
        className="group w-full"
      >
        <span>Checkout · {formattedTotal}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
}
