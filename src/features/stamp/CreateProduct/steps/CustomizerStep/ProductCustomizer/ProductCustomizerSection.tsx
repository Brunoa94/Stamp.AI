import { RefObject } from "react";
import ProductCustomizerHeader from "./ProductCustomizerHeader";
import StampItButton from "../../../components/StampItButton";
import { FabricCardSelector } from "../../FabricStep/FabricCardSelector/FabricCardSelector";
import { Button } from "@/features/ui/button";
import { ArrowRightIcon } from "@/theme";
import { ProductCustomization } from "./ProductCustomization";
import useProductCustomizerSection from "./hooks/useProductCustomizerSection";
import { useUser } from "@/hooks/useAuth";
import { useCreateProductAndAddToCart } from "../../../hooks/useCreateCustomProduct";
import { CreateProductSelectors } from "../../../context/selectors";
import { useCreateProductSubscriberActions } from "../../../context/actions";

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
      <ProductCustomizerHeader />

      <div className="bg-transparent border-2 border-transparent bg-linear-to-r from-slate-500 via-gray-500 to-slate-600 rounded-lg p-0.5 shadow-lg">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
          <FabricCardSelector
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
