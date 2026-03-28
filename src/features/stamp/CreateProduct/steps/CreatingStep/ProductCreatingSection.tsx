"use client";

import { RefObject } from "react";
import { CreatingSpinner } from "./CreatingSpinner";
import { CreatingTitle } from "./CreatingTitle";
import { CreatingStepList } from "./CreatingStepList";
import { CreatingProgressBar } from "./CreatingProgressBar";

interface ProductCreatingSectionProps {
  sectionRef: RefObject<HTMLElement | null>;
}

export function ProductCreatingSection({
  sectionRef,
}: ProductCreatingSectionProps) {
  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center justify-center gap-8 py-12 animate-[fadeIn_0.6s_ease-out]"
      aria-label="Creating product"
      role="status"
      aria-live="polite"
    >
      <CreatingSpinner />
      <CreatingTitle />
      <CreatingStepList />
      <CreatingProgressBar />
    </section>
  );
}
