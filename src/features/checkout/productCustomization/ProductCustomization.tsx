"use client";

import React from "react";
import { useProductCustomizer } from "../hooks/useProductCustomizer";

import { CheckoutErrorDisplay } from "../components";
import {
  DesignUploadSection,
  ProductSelectionSection,
  VariantSelectionSection,
  QuantitySelector,
  CustomizationSummary,
} from "./components";
import { ProductCustomizationT } from "@/schemas/checkout";
import { TshirtType } from "@/queries";

interface Props {
  onCustomizationComplete: (customization: ProductCustomizationT) => void;
  onError?: (error: string) => void;
}

const ProductCustomization = ({ onCustomizationComplete, onError }: Props) => {
  const {
    catalogBlueprints,
    selectedBlueprint,
    blueprintVariants,
    availableColors,
    availableSizes,
    selectedColor,
    selectedSize,
    selectedVariantId,
    quantity,
    uploadedFrontImage,
    uploadedBackImage,
    activePrintSide,
    loading,
    loadingVariants,
    error,
    isFirstTryFront,
    isFirstTryBack,
    setSelectedBlueprint,
    setSelectedColor,
    setSelectedSize,
    setActivePrintSide,
    handleFrontImageUpload,
    handleBackImageUpload,
    removeFrontImage,
    removeBackImage,
    incrementQuantity,
    decrementQuantity,
    setError,
    getSizesForColor,
  } = useProductCustomizer();

  const [selectedTshirtType, setSelectedTshirtType] =
    React.useState<TshirtType | null>(null);

  const handleSubmit = () => {
    if (
      !selectedBlueprint ||
      !uploadedFrontImage ||
      !selectedVariantId ||
      !selectedTshirtType
    ) {
      const errorMsg =
        "Please select a product, color, size, t-shirt type, and upload at least a front design";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    const print_areas: ProductCustomizationT["print_areas"] = {};
    if (uploadedFrontImage) {
      print_areas.front = uploadedFrontImage.id;
    }
    if (uploadedBackImage) {
      print_areas.back = uploadedBackImage.id;
    }

    const totalPrice = 25.0 + selectedTshirtType.price;

    const customization: ProductCustomizationT = {
      product_id: "",
      variant_id: selectedVariantId,
      quantity,
      print_areas,
      product_title: selectedBlueprint.title,
      variant_title: `${selectedBlueprint.brand} ${selectedBlueprint.model}`,
      price: totalPrice,
      preview_url: uploadedFrontImage.preview_url,
      blueprint_id: selectedBlueprint.id,
      print_provider_id: 99,
      tshirt_type: selectedTshirtType,
    };

    onCustomizationComplete(customization);
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center p-8"
        role="status"
        aria-live="polite"
      >
        <div
          className="animate-spin h-8 w-8 text-blue-600 border-4 border-gray-200 border-t-blue-600 rounded-full"
          aria-hidden="true"
        />
        <span className="ml-2 text-gray-600">Loading products...</span>
      </div>
    );
  }

  const showVariantSelection = !!selectedBlueprint;
  const showQuantityAndTshirt =
    selectedBlueprint && uploadedFrontImage && selectedVariantId;
  const showSummary =
    selectedBlueprint &&
    uploadedFrontImage &&
    selectedVariantId &&
    selectedTshirtType;

  return (
    <div className="space-y-6">
      {error && (
        <CheckoutErrorDisplay error={error} onDismiss={() => setError(null)} />
      )}

      <DesignUploadSection
        uploadedFrontImage={uploadedFrontImage}
        uploadedBackImage={uploadedBackImage}
        activePrintSide={activePrintSide}
        onFrontImageUpload={handleFrontImageUpload}
        onBackImageUpload={handleBackImageUpload}
        onRemoveFrontImage={removeFrontImage}
        onRemoveBackImage={removeBackImage}
        onSideChange={setActivePrintSide}
      />

      <ProductSelectionSection
        catalogBlueprints={catalogBlueprints}
        selectedBlueprint={selectedBlueprint}
        onBlueprintSelect={setSelectedBlueprint}
      />

      {showVariantSelection && (
        <VariantSelectionSection
          selectedBlueprint={selectedBlueprint}
          blueprintVariants={blueprintVariants}
          availableColors={availableColors}
          availableSizes={availableSizes}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          selectedVariantId={selectedVariantId}
          loadingVariants={loadingVariants}
          onColorSelect={setSelectedColor}
          onSizeSelect={setSelectedSize}
          getSizesForColor={getSizesForColor}
        />
      )}

      {showVariantSelection && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <QuantitySelector
            quantity={quantity}
            onIncrement={incrementQuantity}
            onDecrement={decrementQuantity}
          />
        </div>
      )}

      {showSummary && (
        <CustomizationSummary
          selectedBlueprint={selectedBlueprint}
          uploadedFrontImage={uploadedFrontImage}
          uploadedBackImage={uploadedBackImage}
          selectedColor={selectedColor!}
          selectedSize={selectedSize!}
          selectedTshirtType={selectedTshirtType}
          quantity={quantity}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default ProductCustomization;
