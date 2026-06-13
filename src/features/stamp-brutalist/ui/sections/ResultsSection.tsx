"use client";

import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { useStampFlowStore } from "../../lib/context/StampFormContext";
import { ResultsGallery } from "../components/ResultsGallery";
import { SectionHeader } from "../components/SectionHeader";
import { useStampNavigation } from "../../lib/hooks/useStampNavigation";
import { usePrefetchTshirtProducts } from "@/queries/productQueries";

export function ResultsSection() {
  const selectedImageUrl = useStampFlowStore((s) => s.selectedImageUrl);
  const { goToStep } = useStampNavigation();

  // Prefetch products for the next step
  usePrefetchTshirtProducts();

  const handleUseProtocol = () => {
    goToStep(5);
  };

  const handleResynthesize = () => {
    goToStep(2);
  };

  return (
    <section id="step-4" className="stamp-section p-12 lg:p-24">
      <div className="section-bg-overlay">
        <div className="gradient-layer" style={{ animationDelay: "-2s" }}></div>
      </div>

      <div className="max-w-6xl border-l-4 border-brandPurple/30 pl-8 md:pl-16 relative z-10">
        <SectionHeader
          stepNumber="04"
          title="Output"
          highlightedWord="Results"
          accentColor="brandPurple"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-8">
            <div className="bg-white border-8 border-ink shadow-[40px_40px_0px_rgba(147,51,234,0.1)] aspect-square overflow-hidden">
              {selectedImageUrl ? (
                <img
                  src={selectedImageUrl}
                  className="w-full h-full object-cover"
                  alt="Generated Output"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Span className="opacity-40">No image generated</Span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-4">
              <Heading variant="card" className="tracking-tight">
                Execution Tools
              </Heading>

              <Button
                type="button"
                onClick={handleUseProtocol}
                className="w-full h-auto rounded-none bg-ink text-white font-anton text-xl py-6 tracking-widest uppercase hover:bg-brandPurple transition-colors shadow-lg shadow-brandPurple/20"
              >
                USE THIS PROTOCOL
              </Button>

              <Button
                type="button"
                onClick={handleResynthesize}
                variant="outline"
                className="w-full h-auto rounded-none border-2 border-ink font-anton text-xl py-6 tracking-widest uppercase hover:bg-ink hover:text-white"
              >
                RE-SYNTHESIZE
              </Button>
            </div>

            <ResultsGallery />
          </div>
        </div>
      </div>
    </section>
  );
}
