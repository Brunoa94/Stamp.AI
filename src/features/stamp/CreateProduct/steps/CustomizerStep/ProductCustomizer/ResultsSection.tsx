"use client";

import ErrorDisplay from "@/features/stamp/CreateProduct/components/ErrorDisplay";
import { CreateProductSelectors } from "../../../context/selectors";
import { useCreateProductSubscriberActions } from "../../../context/actions";
import { WizardActionFooter } from "@/features/ui/wizard-action-footer";
import { WizardStepHeader } from "@/features/ui/wizard-step-header";
import Image from "next/image";
import { useState } from "react";
import { Check } from "lucide-react";
import useScrollToSection from "@/hooks/useScrollToSection";
import { usePrefetchTshirtProducts } from "@/queries/productQueries";
import { GeneratedHistoryRail } from "./GeneratedHistoryRail";
interface IResultsSectionProps {
  ref?: React.Ref<HTMLElement>;
}

const ResultsSection = ({ ref }: IResultsSectionProps) => {
  const generatedResult = CreateProductSelectors.generatedResult();
  const generationError = CreateProductSelectors.generationError();
  const { handleUseImage, handleBackToSynthesis } =
    useCreateProductSubscriberActions();
  const { smoothScrollToElementById } = useScrollToSection();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mockupError, setMockupError] = useState(false);

  // Prefetch canvas/tshirt data while the user reviews their design
  // so it's already in cache when they reach the Choose your Canvas step
  usePrefetchTshirtProducts();

  const handleContinue = () => {
    handleUseImage();
    smoothScrollToElementById("design-pipeline", {
      block: "start",
      delay: 150,
      offset: -48,
    });
  };

  const error = generationError?.message;
  const hasError = !!error;

  if (hasError) return <ErrorDisplay error={error} />;
  if (!generatedResult?.imageUrl) return null;

  return (
    <section ref={ref} className="flex-1 flex flex-col relative bg-white/10">
      <WizardStepHeader
        stepNumber="Step 03"
        title="Final Inspection"
        description="Review your final design before proceeding to checkout."
        currentDot={2}
        totalDots={5}
      />

      <div className="px-4 pt-2 sm:px-12 sm:pt-4">
        <GeneratedHistoryRail />
      </div>

      {/* 3D Preview Area */}
      <div className="flex-1 px-4 sm:px-12 pb-6 sm:pb-10 flex justify-center">
        {/* Main Stage */}
        <div className="flex-1 relative bg-white/40 rounded-xl overflow-hidden shadow-inner border border-white/50">
          {/* Viewer Placeholder (Simulated 3D) */}
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-12">
            <div className="relative w-full max-w-lg">
              {/* T-Shirt Mockup */}
              {!mockupError ? (
                <Image
                  src="/mockup-tee-front.png"
                  alt="T-Shirt Mockup"
                  width={600}
                  height={600}
                  className="w-full drop-shadow-2xl"
                  onError={() => setMockupError(true)}
                  priority
                />
              ) : (
                <div className="w-full aspect-square bg-linear-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-3/4 h-3/4 text-slate-300"
                    fill="currentColor"
                  >
                    <path d="M60 40 L50 60 L50 140 L70 140 L70 180 L130 180 L130 140 L150 140 L150 60 L140 40 L125 50 L100 45 L75 50 Z" />
                  </svg>
                </div>
              )}

              {/* Overlay User Artwork */}
              <div className="absolute top-[10%] left-[8%] w-[84%] h-[75%] flex items-center justify-center opacity-95 will-change-transform motion-safe:animate-[inspectionFloat_6s_cubic-bezier(0.37,0,0.63,1)_infinite] motion-reduce:animate-none">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse text-slate-400 text-sm font-accent">
                      Loading design...
                    </div>
                  </div>
                )}
                <div
                  className={`relative isolate h-full w-full overflow-hidden rounded-2xl bg-white p-2 transition-all duration-700 ease-out will-change-transform motion-safe:animate-[inspectionGlow_4.8s_cubic-bezier(0.37,0,0.63,1)_infinite] motion-reduce:animate-none ${
                    imageLoaded ? "opacity-100" : "opacity-80"
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-2 rounded-xl bg-white"
                  />
                  {/* Use a plain <img> for external URLs to avoid Next.js image host configuration errors during tests */}
                  {typeof generatedResult.imageUrl === "string" &&
                  (generatedResult.imageUrl.startsWith("http://") ||
                    generatedResult.imageUrl.startsWith("https://")) ? (
                    <img
                      src={generatedResult.imageUrl}
                      alt="Your design"
                      className={`z-10 rounded-2xl object-contain drop-shadow-lg transition-all duration-700 ease-out ${
                        imageLoaded
                          ? "scale-100 opacity-100"
                          : "scale-95 opacity-85"
                      }`}
                      onLoad={() => setImageLoaded(true)}
                    />
                  ) : (
                    <Image
                      src={generatedResult.imageUrl}
                      alt="Your design"
                      fill
                      className={`z-10 rounded-2xl object-contain drop-shadow-lg transition-all duration-700 ease-out ${
                        imageLoaded
                          ? "scale-100 opacity-100"
                          : "scale-95 opacity-85"
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      sizes="(max-width: 768px) 300px, 500px"
                      priority
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WizardActionFooter
        onCancel={handleBackToSynthesis}
        onContinue={handleContinue}
        continueText="Looks Good!"
        continueIcon={<Check className="text-2xl" />}
        showBack={false}
        cancelText="Revise Artwork"
      />
    </section>
  );
};

export default ResultsSection;
