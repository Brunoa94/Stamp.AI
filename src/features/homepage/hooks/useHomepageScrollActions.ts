"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseHomepageScrollActionsProps {
  sectionIds: readonly string[];
  navbarHeight: number;
  scrollDuration: number;
  setCurrentSectionIndex: (index: number) => void;
  setIsAtFooter: (isAtFooter: boolean) => void;
}

const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export function useHomepageScrollActions({
  sectionIds,
  navbarHeight,
  scrollDuration,
  setCurrentSectionIndex,
  setIsAtFooter,
}: UseHomepageScrollActionsProps) {
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const getSectionElements = useCallback(() => {
    return sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
  }, [sectionIds]);

  const getCurrentSectionIndex = useCallback(() => {
    const sections = getSectionElements();
    const scrollY = window.scrollY + navbarHeight + 100;

    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].offsetTop <= scrollY) {
        return i;
      }
    }

    return 0;
  }, [getSectionElements, navbarHeight]);

  const smoothScrollTo = useCallback((targetY: number, duration: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateScroll);
      } else {
        animationFrameRef.current = null;
        window.scrollTo(0, targetY);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateScroll);
  }, []);

  const scrollToSection = useCallback(
    (index: number) => {
      const sections = getSectionElements();
      if (index < 0 || index >= sections.length || isScrollingRef.current) return;

      isScrollingRef.current = true;
      setIsAtFooter(false);

      const targetSection = sections[index];
      const targetY = Math.max(0, targetSection.offsetTop - navbarHeight);

      setCurrentSectionIndex(index);
      smoothScrollTo(targetY, scrollDuration);

      setTimeout(() => {
        isScrollingRef.current = false;
      }, scrollDuration + 40);
    },
    [getSectionElements, navbarHeight, scrollDuration, setCurrentSectionIndex, setIsAtFooter, smoothScrollTo],
  );

  const scrollToFooter = useCallback(() => {
    if (isScrollingRef.current) return;

    const footer = document.getElementById("global-footer") || document.querySelector("footer");
    if (!footer) return;

    isScrollingRef.current = true;
    setIsAtFooter(true);

    const targetY = document.documentElement.scrollHeight - window.innerHeight;
    smoothScrollTo(targetY, scrollDuration);

    setTimeout(() => {
      isScrollingRef.current = false;
    }, scrollDuration + 40);
  }, [scrollDuration, setIsAtFooter, smoothScrollTo]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const previous = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    return () => {
      document.documentElement.style.scrollBehavior = previous;
    };
  }, []);

  return {
    getCurrentSectionIndex,
    isScrollingRef,
    lastScrollTimeRef,
    scrollToFooter,
    scrollToSection,
  };
}
