"use client";

import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { useFormContext } from "react-hook-form";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";
import { ColorSwatchGrid } from "../components/ColorSwatchGrid";
import { SectionHeader } from "../components/SectionHeader";
import { useBlueprintVariants } from "@/queries/productQueries";
import { useStampNavigation } from "../../lib/hooks/useStampNavigation";

export function ColorSelectionSection() {
  const { watch } = useFormContext<StampFormData>();
  const blueprintId = watch("blueprintId");
  const printProviderId = watch("printProviderId");
  const selectedColor = watch("selectedColor");

  const { data: variants, isLoading: loadingVariants } = useBlueprintVariants(
    blueprintId,
    printProviderId,
  );
  const { goToStep } = useStampNavigation();

  // Transform variants for color selection
  const availableColors = (variants?.colors || []).map((color) => ({
    title: color,
    colors: [color],
    is_available: true,
  }));

  const handleContinue = () => {
    if (selectedColor) {
      goToStep(7); // Move to size selection
    }
  };

  return (
    <section id="step-6" className="stamp-section p-12 lg:p-24">
      {/* Background decorations */}
      <div className="section-bg-overlay">
        <div
          className="gradient-layer"
          style={{ animationDuration: "25s" }}
        ></div>
        <div
          className="blob w-[50vw] h-[50vw] bg-brandOrange/10 top-20 left-10"
          style={{ animation: "floatBlob 35s ease-in-out infinite" }}
        ></div>
      </div>

      <div className="max-w-6xl border-l-4 border-brandOrange/30 pl-8 md:pl-16 relative z-10">
        <SectionHeader
          stepNumber="06"
          title="Color"
          highlightedWord="Selection"
          accentColor="brandOrange"
        />

        {loadingVariants ? (
          <div className="text-center py-8">
            <Span className="opacity-40">Loading colors...</Span>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="mb-4">
              <Span className="font-anton text-xl tracking-wider uppercase text-brandOrange">
                Choose Your Color
              </Span>
            </div>

            <ColorSwatchGrid colors={availableColors} />

            <Button
              type="button"
              onClick={handleContinue}
              disabled={!selectedColor}
              className="w-full h-auto rounded-none bg-ink text-white font-anton text-xl py-4 tracking-widest uppercase hover:bg-brandOrange hover:text-ink transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedColor ? "CONTINUE TO SIZE" : "SELECT A COLOR"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
