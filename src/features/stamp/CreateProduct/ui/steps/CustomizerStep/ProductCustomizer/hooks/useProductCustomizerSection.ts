import { useEffect } from "react";
import { useBlueprintVariants, type TshirtType } from "@/queries/productQueries";
import { CreateProductSelectors } from "@/features/stamp/CreateProduct/lib/context/selectors";
import { useCreateProductSubscriberActions } from "@/features/stamp/CreateProduct/lib/context/actions";

interface Props{
    selectedTshirt?:TshirtType | null;
}

export default function useProductCustomizerSection({selectedTshirt}: Props){
    const selectedColor = CreateProductSelectors.selectedColor();
    const selectedSize = CreateProductSelectors.selectedSize();
    const { handleColorSelect, handleSizeSelect } = useCreateProductSubscriberActions();

    const { data: variantsData, isLoading: isLoadingVariants } =
    useBlueprintVariants(
        selectedTshirt?.blueprint_id,
        selectedTshirt?.print_provider_id,
    );

    // Reset color and size when tshirt changes
    useEffect(() => {
        handleColorSelect(null);
        handleSizeSelect(null);
    }, [selectedTshirt?.blueprint_id]);

    // Auto-select first color and size when variants load
    useEffect(() => {
        if (variantsData) {
        // Auto-select first color and size when variants load or tshirt changes
        handleColorSelect(variantsData.colors[0] || null);
        handleSizeSelect(variantsData.sizes[0] || null);
        } else {
        // Reset when no data (e.g., tshirt changed and new data is loading)
        handleColorSelect(null);
        handleSizeSelect(null);
        }
    }, [selectedTshirt?.blueprint_id, variantsData]);

    const colorOptions =
    variantsData?.colors.map((color) => ({
        name: color,
        available: true,
    })) || [];

    const sizeOptions =
    variantsData?.sizes.map((size) => ({
        name: size,
        available: true,
    })) || [];

    const canStampIt = selectedTshirt && selectedColor && selectedSize;

    return{
    colorOptions,
    sizeOptions,
    canStampIt,
    selectedColor,
    selectedSize,
    isLoadingVariants,
    setSelectedColor: handleColorSelect,
    setSelectedSize: handleSizeSelect
    }
}
