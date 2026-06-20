"use client";

import { RefObject } from "react";
import { ProductCreatingSection } from "../../sections/ProductCreatingSection";

interface CreatingStepProps {
  sectionRef: RefObject<HTMLElement | null>;
}

export function CreatingStep({ sectionRef }: CreatingStepProps) {
  return (
    <div className="h-full flex items-center justify-center animate-[slideIn_0.5s_ease-out]">
      <ProductCreatingSection sectionRef={sectionRef} />
    </div>
  );
}
