"use client";

import { useMemo, useState } from "react";
import { useHomepageScrollActions } from "./useHomepageScrollActions";
import { useHomepageScrollInteractions } from "./useHomepageScrollInteractions";
import { useHomepageScrollProgress } from "./useHomepageScrollProgress";

interface UseHomepageSectionScrollProps {
  sectionIds: readonly string[];
  navbarHeight: number;
  scrollCooldown: number;
  scrollDuration: number;
  processSectionId: string;
  processStepsCount: number;
  enableScrollSnap?: boolean;
}

export function useHomepageSectionScroll({
  sectionIds,
  navbarHeight,
  scrollCooldown,
  scrollDuration,
  processSectionId,
  processStepsCount,
  enableScrollSnap = true,
}: UseHomepageSectionScrollProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroScale, setHeroScale] = useState(1);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [activeProcessStep, setActiveProcessStep] = useState(0);
  const [isAtFooter, setIsAtFooter] = useState(false);

  const processSectionIndex = useMemo(
    () => sectionIds.indexOf(processSectionId),
    [processSectionId, sectionIds],
  );

  const { getCurrentSectionIndex, isScrollingRef, lastScrollTimeRef, scrollToFooter, scrollToSection } =
    useHomepageScrollActions({
      sectionIds,
      navbarHeight,
      scrollDuration,
      setCurrentSectionIndex,
      setIsAtFooter,
    });

  useHomepageScrollProgress({
    getCurrentSectionIndex,
    isScrollingRef,
    processSectionIndex,
    processStepsCount,
    setActiveProcessStep,
    setCurrentSectionIndex,
    setHeroScale,
    setScrollProgress,
  });

  useHomepageScrollInteractions({
    totalSections: sectionIds.length,
    currentSectionIndex,
    processSectionIndex,
    processStepCount: processStepsCount,
    scrollCooldownMs: scrollCooldown,
    activeProcessStep,
    setActiveProcessStep,
    scrollToFooter,
    scrollToSection,
    isAtFooter,
    setIsAtFooter,
    isScrollingRef,
    lastScrollTimeRef,
    enableScrollSnap,
  });

  return {
    activeProcessStep,
    currentSectionIndex,
    heroScale,
    isAtFooter,
    scrollProgress,
    scrollToFooter,
    scrollToSection,
  };
}
