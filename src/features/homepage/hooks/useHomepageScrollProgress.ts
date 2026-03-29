"use client";

import { useEffect } from "react";
import type { MutableRefObject } from "react";

interface UseHomepageScrollProgressProps {
  getCurrentSectionIndex: () => number;
  isScrollingRef: MutableRefObject<boolean>;
  processSectionIndex: number;
  processStepsCount: number;
  setActiveProcessStep: (step: number) => void;
  setCurrentSectionIndex: (index: number) => void;
  setHeroScale: (value: number) => void;
  setScrollProgress: (value: number) => void;
}

export function useHomepageScrollProgress({
  getCurrentSectionIndex,
  isScrollingRef,
  processSectionIndex,
  processStepsCount,
  setActiveProcessStep,
  setCurrentSectionIndex,
  setHeroScale,
  setScrollProgress,
}: UseHomepageScrollProgressProps) {
  useEffect(() => {
    const handleScroll = () => {
      const sectionIndex = getCurrentSectionIndex();

      if (!isScrollingRef.current) {
        setCurrentSectionIndex(sectionIndex);
      }

      const processSection = document.getElementById("process");
      if (processSection && sectionIndex === processSectionIndex) {
        const rect = processSection.getBoundingClientRect();
        const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
        const nextStep = Math.min(
          Math.floor(progress * processStepsCount),
          Math.max(0, processStepsCount - 1),
        );
        setActiveProcessStep(nextStep);
      } else {
        setActiveProcessStep(0);
      }

      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progressRatio = maxScroll > 0 ? scrollTop / maxScroll : 0;
      const progressPercent = Math.max(0, Math.min(100, progressRatio * 100));

      setScrollProgress(progressPercent);
      setHeroScale(Math.max(0.89, 1 - scrollTop / 1000));
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [
    getCurrentSectionIndex,
    isScrollingRef,
    processSectionIndex,
    processStepsCount,
    setActiveProcessStep,
    setCurrentSectionIndex,
    setHeroScale,
    setScrollProgress,
  ]);
}
