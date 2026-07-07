"use client";

import { useEffect, useRef } from "react";
import { useStampFlowStore } from "../stores/stampFlowStore";

/**
 * useStampScrollSync
 *
 * Syncs scroll position with current step using IntersectionObserver.
 * Updates the store when sections come into view.
 */
export function useStampScrollSync() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create observer callback that directly accesses store
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;

          // Update current step based on visible section
          if (sectionId === "hero") {
            useStampFlowStore.getState().setCurrentStep(0);
          } else if (sectionId.startsWith("step-")) {
            const stepNumber = parseInt(sectionId.split("-")[1], 10);
            useStampFlowStore.getState().setCurrentStep(stepNumber);
          }
        }
      });
    };

    // Create observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.5,
      rootMargin: "-100px 0px -100px 0px",
    });

    // Observe all sections
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => {
      observerRef.current?.observe(section);
    });

    // Cleanup
    return () => {
      if (observerRef.current) {
        sections.forEach((section) => {
          observerRef.current?.unobserve(section);
        });
        observerRef.current.disconnect();
      }
    };
  }, []); // Empty deps - only run once on mount
}
