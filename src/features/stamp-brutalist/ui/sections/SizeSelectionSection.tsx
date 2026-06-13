"use client";

import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { useFormContext } from "react-hook-form";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";
import { SizeTileGrid } from "../components/SizeTileGrid";
import { SectionHeader } from "../components/SectionHeader";
import { useBlueprintVariants } from "@/queries/productQueries";
import { useStampProductCreation } from "../../lib/hooks/useStampProductCreation";

export function SizeSelectionSection() {
  const { watch } = useFormContext<StampFormData>();
  const blueprintId = watch("blueprintId");
  const printProviderId = watch("printProviderId");
  const selectedSize = watch("selectedSize");

  const { data: variants, isLoading: loadingVariants } = useBlueprintVariants(
    blueprintId,
    printProviderId,
  );
  const { handleCreateProduct, isFinalizing } = useStampProductCreation();

  // Transform variants for size selection
  const availableSizes = (variants?.sizes || []).map((size) => ({
    title: size,
    is_available: true,
  }));

  return (
    <section id="step-7" className="stamp-section p-12 lg:p-24">
      {/* Background decorations */}
      <div className="section-bg-overlay">
        <div
          className="gradient-layer"
          style={{ animationDuration: "30s" }}
        ></div>
        <div
          className="blob w-[55vw] h-[55vw] bg-brandPurple/10 bottom-0 right-0"
          style={{ animation: "floatBlob 40s ease-in-out infinite reverse" }}
        ></div>
      </div>

      <div className="max-w-6xl border-l-4 border-brandPurple/30 pl-8 md:pl-16 relative z-10">
        <SectionHeader
          stepNumber="07"
          title="Size"
          highlightedWord="Selection"
          accentColor="brandPurple"
        />

        {loadingVariants ? (
          <div className="text-center py-8">
            <Span className="opacity-40">Loading sizes...</Span>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="mb-4">
              <Span className="font-anton text-xl tracking-wider uppercase text-brandPurple">
                Choose Your Size
              </Span>
            </div>

            <SizeTileGrid sizes={availableSizes} />

            <Button
              type="button"
              onClick={handleCreateProduct}
              disabled={isFinalizing || !selectedSize}
              className="w-full h-auto rounded-none bg-ink text-white font-anton text-xl py-4 tracking-widest uppercase hover:bg-brandPurple hover:text-ink transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFinalizing ? "CREATING..." : "CREATE PRODUCT"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
