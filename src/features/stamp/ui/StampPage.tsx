"use client";

import { NavigationSidebar } from "./components/NavigationSidebar";
import { HeroSection } from "./sections/HeroSection/HeroSection";
import { UploadSection } from "./sections/UploadSection/UploadSection";
import { SynthesisSection } from "./sections/SynthesisSection/SynthesisSection";
import { GenerationSection } from "./sections/GenerationSection/GenerationSection";
import { ResultsSection } from "./sections/ResultsSection/ResultsSection";
import { CustomizationSection } from "./sections/CustomizationSection/CustomizationSection";
import { ProductionSection } from "./sections/ProductionSection/ProductionSection";
import { FinalReviewSection } from "./sections/FinalReviewSection/FinalReviewSection";
import { useStampNavigation } from "../lib/hooks/useStampNavigation";
import { StampFormProvider } from "../lib/context/StampFormContext";
import { ProductSelectionSection } from "./sections/ProductSelectionSection/ProductSelectionSection";

/**
 * StampPage
 *
 * Main page component for the Stamp luxury theme flow.
 * Orchestrates the 8-stage synthesis protocol.
 *
 * Follows strict architectural guidelines:
 * - Uses design system components only
 * - Follows FSD architecture
 * - Implements proper accessibility (WCAG 2.1 AA)
 * - Type-safe with explicit TypeScript types
 */

export function StampPage() {
  const { currentStep, goToStep } = useStampNavigation();

  const handleBegin = () => {
    goToStep(1);
  };

  const activeSlide = Math.max(0, Math.min(currentStep, 8));

  return (
    <StampFormProvider>
      <div className="fixed inset-0 bg-(--color-stamp-off-white)">
        {/* Main protocol canvas aligned with the submitted layout */}
        <main className="absolute inset-x-0 top-24 bottom-0 overflow-hidden lg:mr-68">
          <div
            className="h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translate3d(0, -${activeSlide * 100}%, 0)` }}
          >
            {/* Hero Section */}
            <HeroSection onBegin={handleBegin} />

            {/* Step 1: Upload */}
            <UploadSection />

            {/* Step 2: Synthesis */}
            <SynthesisSection />

            {/* Step 3: Generation */}
            <GenerationSection />

            {/* Step 4: Results */}
            <ResultsSection />

            {/* Step 5: Product Selection */}
            <ProductSelectionSection />

            {/* Step 6: Customization */}
            <CustomizationSection />

            {/* Step 7: Production */}
            <ProductionSection />

            {/* Step 8: Final Review */}
            <FinalReviewSection />
          </div>
        </main>

        {/* Sidebar Navigation (Desktop Only) */}
        <NavigationSidebar />
      </div>
    </StampFormProvider>
  );
}
