"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { cartTheme } from "@/theme/components";

interface Props {
  onCheckout: () => void;
}

export function CartMobileCta({ onCheckout }: Props) {
  return (
    <div className={cartTheme.cta.bar}>
      <Button className={cartTheme.cta.button} onClick={onCheckout}>
        <span>PROCEED TO CHECKOUT</span>
        <ArrowRight className="w-5 h-5" aria-hidden="true" />
      </Button>
    </div>
  );
}
