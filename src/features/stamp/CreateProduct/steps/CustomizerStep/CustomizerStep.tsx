"use client";

import dynamic from "next/dynamic";
import { RefObject } from "react";

const ProductCustomizerSection = dynamic(
  () => import("./ProductCustomizer/ProductCustomizerSection"),
  { ssr: false },
);

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
