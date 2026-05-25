"use client";

import { RefObject } from "react";
import { FabricSelectionSection } from "../../sections/FabricSelectionSection";

interface FabricStepProps {
  sectionRef: RefObject<HTMLElement | null>;
}

export function FabricStep({ sectionRef }: FabricStepProps) {
  return (
    <div className="h-full animate-[slideIn_0.5s_ease-out] overflow-y-scroll">
      <FabricSelectionSection sectionRef={sectionRef} />
    </div>
  );
}
