"use client";

import { useCallback } from "react";
import { BackButton } from "./components/BackButton/BackButton";
import { MobileStepFooter } from "./components/MobileStepFooter/MobileStepFooter";
import { NavigationSidebar } from "./components/NavigationSidebar";
import { StampBackdrop } from "./components/StampBackdrop";
import { StampEntryPanel } from "./components/StampEntryPanel";
import { StampStepSlot } from "./components/StampStepSlot";
import { HeroSection } from "./sections/HeroSection/HeroSection";
import { UploadSection } from "./sections/UploadSection/UploadSection";
import { SynthesisSection } from "./sections/SynthesisSection/SynthesisSection";
import { GenerationSection } from "./sections/GenerationSection/GenerationSection";
import { ResultsSection } from "./sections/ResultsSection/ResultsSection";
import { CustomizationSection } from "./sections/CustomizationSection/CustomizationSection";
import { ProductionSection } from "./sections/ProductionSection/ProductionSection";
import { FinalReviewSection } from "./sections/FinalReviewSection/FinalReviewSection";
import { ProductSelectionSection } from "./sections/ProductSelectionSection/ProductSelectionSection";
import { useStampNavigation } from "../lib/hooks/useStampNavigation";
import { useMountedStampSteps } from "../lib/hooks/useMountedStampSteps";
import { isStampBackdropVisible } from "../lib/helpers/stampBackdropHelpers";

/**
 * StampCanvas
 *
 * Inner component that subscribes to currentStep and drives the slide animation.
 * Kept separate from StampPage so that StampFormProvider (the parent) is never
 * caught in the re-render triggered by step navigation.
 */
export function StampCanvas() {
  const { currentStep, goToStep } = useStampNavigation();

  const handleBegin = useCallback(() => {
    goToStep(1);
  }, [goToStep]);

  const activeSlide = Math.max(0, Math.min(currentStep, 8));
  const mountedSteps = useMountedStampSteps(activeSlide);

  return (
    <div className="fixed inset-0 bg-(--color-stamp-off-white)">
      {/* Phase photo (md+): behind the sidebar and half the right column; phones have none */}
      <StampBackdrop currentStep={activeSlide} />

      {/* Back Button (Top Left) */}
      <BackButton />

      {/* Protocol canvas aligned with the submitted layout; AppLayoutChrome provides <main> */}
      <div className="absolute inset-x-0 top-16 bottom-0 overflow-hidden lg:top-24 lg:mr-68">
        {/* data-stamp-slider: SplitToneText follows this slide (useStampSplitTone).
            Steps render once near or visited (useMountedStampSteps), so a first
            visit doesn't hydrate or download the whole flow */}
        <div
          data-stamp-slider=""
          className="h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translate3d(0, -${activeSlide * 100}%, 0)` }}
        >
          {/* Hero Section */}
          <StampStepSlot isMounted={mountedSteps.has(0)}>
            <HeroSection onBegin={handleBegin} />
          </StampStepSlot>

          {/* Step 1: Upload */}
          <StampStepSlot isMounted={mountedSteps.has(1)}>
            <UploadSection />
          </StampStepSlot>

          {/* Step 2: Synthesis */}
          <StampStepSlot isMounted={mountedSteps.has(2)}>
            <SynthesisSection />
          </StampStepSlot>

          {/* Step 3: Generation */}
          <StampStepSlot isMounted={mountedSteps.has(3)}>
            <GenerationSection />
          </StampStepSlot>

          {/* Step 4: Results */}
          <StampStepSlot isMounted={mountedSteps.has(4)}>
            <ResultsSection />
          </StampStepSlot>

          {/* Step 5: Product Selection */}
          <StampStepSlot isMounted={mountedSteps.has(5)}>
            <ProductSelectionSection />
          </StampStepSlot>

          {/* Step 6: Customization */}
          <StampStepSlot isMounted={mountedSteps.has(6)}>
            <CustomizationSection />
          </StampStepSlot>

          {/* Step 7: Production */}
          <StampStepSlot isMounted={mountedSteps.has(7)}>
            <ProductionSection />
          </StampStepSlot>

          {/* Step 8: Final Review */}
          <StampStepSlot isMounted={mountedSteps.has(8)}>
            <FinalReviewSection />
          </StampStepSlot>
        </div>
      </div>

      {/* Entry step's product scan (lg+), over the canvas so leaving step 00 wipes it
          across the incoming step into the backdrop's shape; under the sidebar */}
      <StampEntryPanel isActive={!isStampBackdropVisible(activeSlide)} />

      {/* Sidebar Navigation (Desktop Only) */}
      <NavigationSidebar />

      {/* Mobile Sticky Footer */}
      <MobileStepFooter />
    </div>
  );
}
