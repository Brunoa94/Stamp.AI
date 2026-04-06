"use client";

import { RefObject } from "react";
import { CreatingSpinner } from "./CreatingSpinner";
import { CreatingTitle } from "./CreatingTitle";
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
      className="flex w-full max-w-120 flex-col gap-12 items-center animate-[fadeIn_0.6s_ease-out]"
      aria-label="Creating product"
      role="status"
      aria-live="polite"
    >
      <CreatingSpinner />

      <CreatingTitle />

      <CreatingProgressBar />
    </section>
  );
}
