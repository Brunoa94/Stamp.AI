"use client";

import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { useFormContext } from "react-hook-form";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";
import { StyleSelector } from "../components/StyleSelector";
import { PreservationSlider } from "../components/PreservationSlider";
import { SectionHeader } from "../components/SectionHeader";
import { useStampImageGeneration } from "../../lib/hooks/useStampImageGeneration";

export function SynthesisSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<StampFormData>();
  const { handleGenerate, isGenerating } = useStampImageGeneration();

  return (
    <section id="step-2" className="stamp-section p-12 lg:p-24">
      {/* Background decorations */}
      <div className="section-bg-overlay">
        <div className="gradient-layer synthesis-gradient-delayed"></div>
        <div className="blob w-[50vw] h-[50vw] bg-brandCyan/20 bottom-10 right-10 synthesis-blob"></div>
      </div>

      <div className="max-w-4xl border-l-4 border-brandCyan/30 pl-8 md:pl-16 relative z-10">
        <SectionHeader
          stepNumber="02"
          title="AI"
          highlightedWord="Synthesis"
          accentColor="brandCyan"
        />

        <div className="space-y-16">
          {/* Prompt textarea */}
          <div className="space-y-4">
            <Span variant="default" className="opacity-40 uppercase">
              Describe your creative vision
            </Span>
            <textarea
              {...register("prompt")}
              className="w-full h-40 bg-white border border-ink/10 p-8 font-space text-2xl uppercase placeholder:opacity-10 focus:border-brandCyan focus:ring-4 focus:ring-brandCyan/10 outline-none transition-all resize-none"
              placeholder="e.g. glitch cyberpunk city..."
            />
            {errors.prompt && (
              <Span variant="micro" className="text-brandRed">
                {errors.prompt.message}
              </Span>
            )}
          </div>

          {/* Style selector and preservation slider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <StyleSelector />
            </div>
            <div className="space-y-8">
              <PreservationSlider />
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center pt-8">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="h-auto rounded-none relative bg-ink text-white px-20 py-5 font-anton text-3xl tracking-[0.2em] uppercase disabled:opacity-50 border-2 border-brandCyan hover:bg-brandCyan hover:text-ink transition-colors duration-300"
            >
              {isGenerating ? "STAMPING..." : "STAMP IT!"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
