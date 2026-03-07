"use client";

import dynamic from "next/dynamic";
import { RefObject } from "react";

const ResultsSection = dynamic(
  () => import("../CustomizerStep/ProductCustomizer/ResultsSection"),
  {
    ssr: false,
  },
);

interface ResultsStepProps {
  sectionRef: RefObject<HTMLElement | null>;
}

export function ResultsStep({ sectionRef }: ResultsStepProps) {
  return <ResultsSection ref={sectionRef} />;
}
