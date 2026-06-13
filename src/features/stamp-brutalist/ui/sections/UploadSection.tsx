"use client";

import { Button } from "@/features/ui/button";
import { ArrowRight } from "lucide-react";
import { UploadDropzone } from "../components/UploadDropzone";
import { SectionHeader } from "../components/SectionHeader";
import { useStampNavigation } from "../../lib/hooks/useStampNavigation";

export function UploadSection() {
  const { nextStep } = useStampNavigation();

  return (
    <section id="step-1" className="stamp-section p-12 lg:p-24">
      <div className="section-bg-overlay">
        <div className="gradient-layer"></div>
        <div
          className="blob w-[40vw] h-[40vw] bg-brandPurple/30 top-10 left-10"
          style={{ animation: "floatBlob 35s ease-in-out infinite" }}
        ></div>
      </div>

      <div className="max-w-4xl border-l-4 border-brandPurple/30 pl-8 md:pl-16 relative z-10">
        <SectionHeader
          stepNumber="01"
          title="Upload"
          highlightedWord="Reference"
          accentColor="brandPurple"
        />

        <UploadDropzone onNext={nextStep} />

        <div className="mt-12 flex justify-end">
          <Button
            type="button"
            onClick={nextStep}
            variant="ghost"
            className="h-auto rounded-none font-anton text-xl uppercase tracking-widest flex items-center gap-4 hover:text-brandCyan transition-colors"
          >
            Skip Protocol
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </section>
  );
}
