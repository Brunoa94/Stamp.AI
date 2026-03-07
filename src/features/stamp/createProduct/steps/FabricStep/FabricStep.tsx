"use client";

import { RefObject } from "react";
import { FabricSelectionSection } from "./FabricSelectionSection";

interface FabricStepPropsI {
  sectionRef: RefObject<HTMLElement | null>;
}

export function FabricStep({ sectionRef }: FabricStepPropsI) {
  return (
    <div className="h-full animate-[slideIn_0.5s_ease-out]">
      <FabricSelectionSection sectionRef={sectionRef} />
    </div>
  );
}
