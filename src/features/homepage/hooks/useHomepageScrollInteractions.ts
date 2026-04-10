"use client";

import { useCallback, useEffect } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

interface UseHomepageScrollInteractionsProps {
  totalSections: number;
  currentSectionIndex: number;
  processSectionIndex: number;
  processStepCount: number;
  scrollCooldownMs: number;
  activeProcessStep: number;
  setActiveProcessStep: Dispatch<SetStateAction<number>>;
  scrollToFooter: () => void;
  scrollToSection: (index: number) => void;
  isAtFooter: boolean;
  setIsAtFooter: Dispatch<SetStateAction<boolean>>;
  isScrollingRef: MutableRefObject<boolean>;
  lastScrollTimeRef: MutableRefObject<number>;
  enableScrollSnap?: boolean;
}

export function useHomepageScrollInteractions({
  totalSections,
  currentSectionIndex,
  processSectionIndex,
  processStepCount,
  scrollCooldownMs,
  activeProcessStep,
  setActiveProcessStep,
  scrollToFooter,
  scrollToSection,
  isAtFooter,
  setIsAtFooter,
  isScrollingRef,
  lastScrollTimeRef,
  enableScrollSnap = true,
}: UseHomepageScrollInteractionsProps) {
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();

      const now = Date.now();
      if (
        now - lastScrollTimeRef.current < scrollCooldownMs ||
        isScrollingRef.current ||
        Math.abs(event.deltaY) < 20
      ) {
        return;
      }

      const deltaY = event.deltaY;
      const isProcessSection = currentSectionIndex === processSectionIndex;

      if (deltaY > 0) {
        if (isProcessSection && activeProcessStep < processStepCount - 1) {
          setActiveProcessStep((previous) => Math.min(previous + 1, processStepCount - 1));
          lastScrollTimeRef.current = now;
          return;
        }

        if (currentSectionIndex === totalSections - 1) {
          scrollToFooter();
          lastScrollTimeRef.current = now;
          return;
        }

        scrollToSection(currentSectionIndex + 1);
        lastScrollTimeRef.current = now;
        return;
      }

      if (deltaY < 0) {
        if (isAtFooter) {
          setIsAtFooter(false);
          scrollToSection(totalSections - 1);
          lastScrollTimeRef.current = now;
          return;
        }

        if (isProcessSection && activeProcessStep > 0) {
          setActiveProcessStep((previous) => Math.max(previous - 1, 0));
          lastScrollTimeRef.current = now;
          return;
        }

        if (currentSectionIndex > 0) {
          scrollToSection(currentSectionIndex - 1);
          lastScrollTimeRef.current = now;
        }
      }
    },
    [
      activeProcessStep,
      currentSectionIndex,
      isAtFooter,
      totalSections,
      isScrollingRef,
      lastScrollTimeRef,
      processSectionIndex,
      processStepCount,
      scrollCooldownMs,
      scrollToFooter,
      scrollToSection,
      setActiveProcessStep,
      setIsAtFooter,
    ],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const now = Date.now();
      if (isScrollingRef.current) {
        return;
      }
      if (now - lastScrollTimeRef.current < scrollCooldownMs) {
        return;
      }

      const isProcessSection = currentSectionIndex === processSectionIndex;
      const isDown = event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ";
      const isUp = event.key === "ArrowUp" || event.key === "PageUp";

      if (!isDown && !isUp) return;

      event.preventDefault();

      if (isDown) {
        lastScrollTimeRef.current = now;

        if (isProcessSection && activeProcessStep < processStepCount - 1) {
          setActiveProcessStep((previous) => Math.min(previous + 1, processStepCount - 1));
          return;
        }

        if (currentSectionIndex === totalSections - 1) {
          scrollToFooter();
          return;
        }

        scrollToSection(currentSectionIndex + 1);
      }

      if (isUp) {
        lastScrollTimeRef.current = now;

        if (isAtFooter) {
          setIsAtFooter(false);
          scrollToSection(totalSections - 1);
          return;
        }

        if (isProcessSection && activeProcessStep > 0) {
          setActiveProcessStep((previous) => Math.max(previous - 1, 0));
          return;
        }

        if (currentSectionIndex > 0) {
          scrollToSection(currentSectionIndex - 1);
        }
      }
    },
    [
      activeProcessStep,
      currentSectionIndex,
      isAtFooter,
      totalSections,
      isScrollingRef,
      lastScrollTimeRef,
      processSectionIndex,
      processStepCount,
      scrollCooldownMs,
      scrollToFooter,
      scrollToSection,
      setActiveProcessStep,
      setIsAtFooter,
    ],
  );

  useEffect(() => {
    if (enableScrollSnap) {
      window.addEventListener("wheel", handleWheel, { passive: false });
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (enableScrollSnap) {
        window.removeEventListener("wheel", handleWheel);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, handleWheel, enableScrollSnap]);
}
