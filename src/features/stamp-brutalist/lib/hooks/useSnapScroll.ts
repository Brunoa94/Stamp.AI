"use client";

import { useEffect } from "react";
import { useStampFlowStore } from "../context/StampFormContext";

export function useSnapScroll() {
  // Use Zustand store for currentStep
  const currentStep = useStampFlowStore((state) => state.currentStep);

  useEffect(() => {
    const sections = document.querySelectorAll(".stamp-section");
    if (sections.length === 0) return;

    const targetSection = sections[currentStep - 1];
    if (!targetSection) return;

    // Immediately add active class to target section
    targetSection.classList.add("active-section");

    // Remove active class from all other sections immediately
    sections.forEach((section, index) => {
      const stepNumber = index + 1;
      if (stepNumber !== currentStep) {
        section.classList.remove("active-section");
      }
    });
  }, [currentStep]);
}
