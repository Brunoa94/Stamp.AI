import { RefObject, useState, useEffect } from "react";
import { TshirtSelection, TshirtType } from "@/features/dashboard/selectTshirt";
import ProductCustomizerHeader from "./ProductCustomizerHeader";
import StampItButton from "../components/StampItButton";
import { Button } from "@/features/ui/button";
import { ArrowRightIcon } from "@/theme";
import { ProductCustomization } from "./ProductCustomization";
import { useBlueprintVariants } from "../hooks/useBlueprintVariants";
import useProductCustomizerSection from "./hooks/useProductCustomizerSection";
import { useUser } from "@/hooks/useAuth";
import { useCreateProductAndAddToCart } from "../ProductCreateForm/hooks/useCreateCustomProduct";
import { CreateProductSelectors } from "../context/CreateProductContextSubscriber/selectors";
import { useCreateProductSubscriberActions } from "../context/CreateProductContextSubscriber/actions";

interface ProductCustomizerSectionProps {
  sectionRef: RefObject<HTMLElement | null>;
}

export default function ProductCustomizerSection({
  sectionRef,
}: ProductCustomizerSectionProps) {
  const selectedTshirt = CreateProductSelectors.selectedTshirt();
  const isCreatingProduct = CreateProductSelectors.isCreatingProduct();
  const { handleBackToResults } = useCreateProductSubscriberActions();

  const onBack = handleBackToResults;
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
  const { data: user } = useUser();
  // Product creation mutation
  const { createAndAddToCart } = useCreateProductAndAddToCart();
  const generatedResult = CreateProductSelectors.generatedResult();
  const { handleProductCreationStart, handleTshirtSelect: onTshirtSelect } =
    useCreateProductSubscriberActions();

  const onStampIt = async () => {
    if (!generatedResult?.imageUrl || !selectedTshirt || !user) {
      return;
    }

    handleProductCreationStart();

    createAndAddToCart({
      blueprintId: selectedTshirt.blueprint_id,
      printProviderId: selectedTshirt.print_provider_id,
      imageUrl: generatedResult.imageUrl,
      tshirtName: selectedTshirt.name,
      userId: user.id,
      userEmail: user.email,
    });
  };

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

      <div className="bg-transparent border-2 border-transparent bg-linear-to-r from-slate-500 via-gray-500 to-slate-600 rounded-lg p-0.5 shadow-lg">
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
