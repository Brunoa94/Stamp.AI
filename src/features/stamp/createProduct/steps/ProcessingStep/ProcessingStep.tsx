"use client";

import dynamic from "next/dynamic";
import { RefObject } from "react";

const ProcessingSection = dynamic(
  () => import("../../components/ProcessingSection"),
  {
    ssr: false,
  },
);

interface ProcessingStepProps {
  sectionRef: RefObject<HTMLElement | null>;
}

export function ProcessingStep({ sectionRef }: ProcessingStepProps) {
  return (
    <div className="h-full flex items-center justify-center animate-[slideIn_0.5s_ease-out]">
      <ProcessingSection sectionRef={sectionRef} />
    </div>
  );
}
