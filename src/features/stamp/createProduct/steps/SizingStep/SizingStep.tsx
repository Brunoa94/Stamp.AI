"use client";

import { RefObject } from "react";
import { ProductConfirmationSection } from "./ProductConfirmationSection";

interface SizingStepProps {
  sectionRef: RefObject<HTMLElement | null>;
}

export function SizingStep({ sectionRef }: SizingStepProps) {
  return (
    <div className="h-full animate-[slideIn_0.5s_ease-out]">
      <ProductConfirmationSection sectionRef={sectionRef} />
    </div>
  );
}
