"use client";

import { RefObject, useEffect } from "react";
import { ProductConfirmationSection } from "../../sections/ProductConfirmationSection";
import { scrollToIdWithOffset } from "@/utils/scrollToElementWithOffset";

interface SizingStepProps {
  sectionRef: RefObject<HTMLElement | null>;
  isAddedToCart: boolean;
  isPending: boolean;
  isActive: boolean;
}

export function SizingStep({
  sectionRef,
  isAddedToCart,
  isPending,
  isActive,
}: SizingStepProps) {
  useEffect(() => {
    if (!isActive) {
      return;
    }

    return scrollToIdWithOffset("proceed-to-checkout-button", 100);
  }, [isActive]);

  return (
    <div className="h-full animate-[slideIn_0.5s_ease-out]">
      <ProductConfirmationSection
        sectionRef={sectionRef}
        isAddedToCart={isAddedToCart}
        isPending={isPending}
      />
    </div>
  );
}
