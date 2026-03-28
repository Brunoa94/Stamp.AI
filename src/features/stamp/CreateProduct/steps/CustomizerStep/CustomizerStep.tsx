"use client";

import { RefObject } from "react";
import ProductCustomizerSection from "./ProductCustomizer/ProductCustomizerSection";

interface CustomizerStepProps {
  sectionRef: RefObject<HTMLElement | null>;
}

export function CustomizerStep({ sectionRef }: CustomizerStepProps) {
  return (
    <div className="h-full animate-[slideIn_0.5s_ease-out]">
      <ProductCustomizerSection sectionRef={sectionRef} />
    </div>
  );
}
