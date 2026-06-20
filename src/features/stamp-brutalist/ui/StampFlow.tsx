"use client";

import { useEffect, useRef, memo } from "react";
import { useSnapScroll } from "../lib/hooks/useSnapScroll";
import { useStampFlowStore } from "../lib/context/StampFormContext";
import { StampIconSidebar } from "./components/StampIconSidebar";
import { GrainOverlay } from "@/features/layout/brutalist/GrainOverlay";
import { PageHeader } from "@/shared/ui/PageHeader";

// Section imports - memoized
import { UploadSection } from "./sections/UploadSection";
import { SynthesisSection } from "./sections/SynthesisSection";
import { GenerationSection } from "./sections/GenerationSection";
import { ResultsSection } from "./sections/ResultsSection";
import { ProductSpecSection } from "./sections/ProductSpecSection";
import { CustomizationSection } from "./sections/CustomizationSection";
import { ProductionSection } from "./sections/ProductionSection";
import { FinalReviewSection } from "./sections/FinalReviewSection";

export const StampFlow = memo(function StampFlow() {
  // Zustand selectors for fine-grained subscriptions
  const isGenerating = useStampFlowStore((s) => s.isGenerating);
  const isFinalizing = useStampFlowStore((s) => s.isFinalizing);
  const setCurrentStep = useStampFlowStore((s) => s.setCurrentStep);
  const setGeneratedResults = useStampFlowStore((s) => s.setGeneratedResults);

  const wasGenerating = useRef(false);
  const wasFinalizing = useRef(false);

  // Initialize snap scroll observer
  useSnapScroll();

  // Load generated history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(
        "stamp-brutalist:generated-history",
      );
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setGeneratedResults(history);
      }
    } catch (e) {
      console.warn("Failed to load history from localStorage:", e);
    }
  }, [setGeneratedResults]);

  // Auto-advance when generation completes
  useEffect(() => {
    if (!isGenerating && wasGenerating.current) {
      setTimeout(() => {
        setCurrentStep(4); // Go to Results
        const isMobile = window.innerWidth < 1024; // lg breakpoint
        if (isMobile) {
          const section = document.getElementById("step-4");
          section?.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }
    wasGenerating.current = isGenerating;
  }, [isGenerating, setCurrentStep]);

  // Auto-advance when finalization completes
  useEffect(() => {
    if (!isFinalizing && wasFinalizing.current) {
      setTimeout(() => {
        setCurrentStep(8); // Go to Final Review (step 8)
        const isMobile = window.innerWidth < 1024; // lg breakpoint
        if (isMobile) {
          const section = document.getElementById("step-8");
          section?.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }
    wasFinalizing.current = isFinalizing;
  }, [isFinalizing, setCurrentStep]);

  return (
    <>
      <GrainOverlay />

      {/* Page Header - Fixed at top */}

      <div className="max-w-400 mx-auto">
        <PageHeader
          title="Stamp"
          highlightedWord="It"
          subtitle="Create your custom product"
        />
      </div>

      <div className="relative flex min-h-screen -mt-24">
        {/* Icon Sidebar */}
        <StampIconSidebar />

        {/* Main Snap Container */}
        <div id="stamp-snap-root" className="stamp-snap-container flex-1">
          {/* Step 1: Upload */}
          <UploadSection />

          {/* Step 2: Synthesis */}
          <SynthesisSection />

          {/* Step 3: Generation (auto loading) */}
          <GenerationSection />

          {/* Step 4: Results */}
          <ResultsSection />

          {/* Step 5: Product Selection */}
          <ProductSpecSection />

          {/* Step 6: Customization (Color & Size) */}
          <CustomizationSection />

          {/* Step 7: Production (auto loading) */}
          <ProductionSection />

          {/* Step 8: Final Review */}
          <FinalReviewSection />
        </div>
      </div>
    </>
  );
});
