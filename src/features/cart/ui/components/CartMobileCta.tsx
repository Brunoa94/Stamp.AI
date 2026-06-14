"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";

interface Props {
  onCheckout: () => void;
}

export function CartMobileCta({ onCheckout }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-ink/10 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <Button
        onClick={onCheckout}
        variant="brutalist-checkout"
        className="w-full group"
      >
        Proceed to Checkout
        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
      </Button>
    </div>
  );
}
