import { RefObject, useState, useEffect } from "react";
import { TshirtSelection, TshirtType } from "@/features/dashboard/selectTshirt";
import ProductCustomizerHeader from "./ProductCustomizerHeader";
import StampItButton from "../components/StampItButton";
import { Button } from "@/features/ui/button";
import { ArrowRightIcon } from "@/theme";
import { ProductCustomization } from "./ProductCustomization";
import { useBlueprintVariants } from "../hooks/useBlueprintVariants";
import useProductCustomizerSection from "./hooks/useProductCustomizerSection";

interface ProductCustomizerSectionProps {
  sectionRef: RefObject<HTMLElement | null>;
  selectedTshirt: TshirtType | null;
  onTshirtSelect: (tshirt: TshirtType) => void;
  onStampIt: () => void;
  onBack: () => void;
  isCreatingProduct: boolean;
}

export default function ProductCustomizerSection({
  sectionRef,
  selectedTshirt,
  onTshirtSelect,
  onStampIt,
  onBack,
  isCreatingProduct,
}: ProductCustomizerSectionProps) {
  const {
    colorOptions,
    sizeOptions,
    canStampIt,
    selectedColor,
    selectedSize,
    isLoadingVariants,
    setSelectedColor,
    setSelectedSize,
  } = useProductCustomizerSection({ selectedTshirt });

  return (
    <section
      ref={sectionRef}
      className="space-y-8 animate-[slideInUp_1s_ease-out] transform transition-all duration-1000"
      aria-label="Product customizer"
    >
      {/* Back Button */}
      <div className="flex justify-start">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
        >
          <ArrowRightIcon className="w-4 h-4 rotate-180" />
          Back to Results
        </Button>
      </div>

      <ProductCustomizerHeader />

      <div className="bg-transparent border-2 border-transparent bg-linear-to-r from-purple-500 via-pink-500 to-purple-500 rounded-lg p-0.5 shadow-lg">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
          <TshirtSelection
            onTshirtSelect={onTshirtSelect}
            selectedTshirt={selectedTshirt ?? undefined}
          />
        </div>
      </div>

      {selectedTshirt && (
        <ProductCustomization
          isLoading={isLoadingVariants}
          colorOptions={colorOptions}
          sizeOptions={sizeOptions}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          onColorSelect={setSelectedColor}
          onSizeSelect={setSelectedSize}
        />
      )}

      {canStampIt && (
        <StampItButton onClick={onStampIt} isLoading={isCreatingProduct} />
      )}
    </section>
  );
}
