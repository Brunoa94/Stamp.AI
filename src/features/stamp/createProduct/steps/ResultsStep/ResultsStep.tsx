"use client";

import { RefObject } from "react";
import ResultsSection from "../CustomizerStep/ProductCustomizer/ResultsSection";

interface ResultsStepProps {
  sectionRef: RefObject<HTMLElement | null>;
}

export function ResultsStep({ sectionRef }: ResultsStepProps) {
  return <ResultsSection ref={sectionRef} />;
}
