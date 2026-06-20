"use client";

import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { useFormContext } from "react-hook-form";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";
import { ColorSwatchGrid } from "../components/ColorSwatchGrid";
import { SizeTileGrid } from "../components/SizeTileGrid";
import { SectionHeader } from "../components/SectionHeader";
import { useBlueprintVariants } from "@/queries/productQueries";
import { useStampProductCreation } from "../../lib/hooks/useStampProductCreation";

export function CustomizationSection() {
  const { watch } = useFormContext<StampFormData>();
  const blueprintId = watch("blueprintId");
  const printProviderId = watch("printProviderId");
  const selectedColor = watch("selectedColor");
  const selectedSize = watch("selectedSize");

  const { data: variants, isLoading: loadingVariants } = useBlueprintVariants(
    blueprintId,
    printProviderId,
  );
  const { handleCreateProduct, isFinalizing } = useStampProductCreation();

  const availableColors =
    variants?.colors.map((color) => ({
      title: color,
      colors: [color],
      is_available: true,
    })) || [];

  const availableSizes =
    variants?.sizes.map((size) => ({
      title: size,
      is_available: true,
    })) || [];

  const getButtonText = () => {
    if (isFinalizing) return "CREATING...";
    if (selectedColor && selectedSize) return "CREATE PRODUCT";
    return "SELECT COLOR & SIZE";
  };

  const isDisabled = isFinalizing || !selectedColor || !selectedSize;

  return (
    <section id="step-6" className="stamp-section p-12 lg:p-24">
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
          title="Customize"
          highlightedWord="Product"
          accentColor="brandOrange"
        />

        {loadingVariants ? (
          <div className="text-center py-8">
            <Span className="opacity-40">Loading options...</Span>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-brandOrange"></div>
                <Span className="font-anton text-2xl tracking-wider uppercase text-brandOrange">
                  01 / Color
                </Span>
              </div>
              <ColorSwatchGrid colors={availableColors} />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-brandPurple"></div>
                <Span className="font-anton text-2xl tracking-wider uppercase text-brandPurple">
                  02 / Size
                </Span>
              </div>
              <SizeTileGrid sizes={availableSizes} />
            </div>

            <div className="pt-6">
              <Button
                type="button"
                onClick={handleCreateProduct}
                disabled={isDisabled}
                className="w-full h-auto rounded-none bg-ink text-white font-anton text-xl py-4 tracking-widest uppercase hover:bg-brandOrange hover:text-ink transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {getButtonText()}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
