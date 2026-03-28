"use client";

import { RefObject } from "react";
import { ProductConfirmationSection } from "../../sections/ProductConfirmationSection";

interface SizingStepProps {
  sectionRef: RefObject<HTMLElement | null>;
  isAddedToCart: boolean;
  isPending: boolean;
}

export function SizingStep({
  sectionRef,
  isAddedToCart,
  isPending,
}: SizingStepProps) {
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
