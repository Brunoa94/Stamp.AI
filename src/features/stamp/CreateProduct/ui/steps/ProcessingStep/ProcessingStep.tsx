"use client";

import { RefObject } from "react";
import ProcessingSection from "../../sections/ProcessingSection";

interface ProcessingStepProps {
  sectionRef: RefObject<HTMLElement | null>;
}

export function ProcessingStep({ sectionRef }: ProcessingStepProps) {
  return (
    <div className="h-full flex flex-col animate-[slideIn_0.5s_ease-out]">
      <ProcessingSection sectionRef={sectionRef} />
    </div>
  );
}
