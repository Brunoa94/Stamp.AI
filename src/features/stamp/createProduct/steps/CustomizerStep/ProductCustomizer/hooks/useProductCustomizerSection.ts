import { useEffect, useState } from "react";
import { useBlueprintVariants, type TshirtType } from "@/queries/productQueries";

interface Props{
    selectedTshirt?:TshirtType | null;
}

export default function useProductCustomizerSection({selectedTshirt}: Props){
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const { data: variantsData, isLoading: isLoadingVariants } =
    useBlueprintVariants(
        selectedTshirt?.blueprint_id,
        selectedTshirt?.print_provider_id,
    );

    // Reset color and size when tshirt changes
    useEffect(() => {
        setSelectedColor(null);
        setSelectedSize(null);
    }, [selectedTshirt?.blueprint_id]);

    // Auto-select first color and size when variants load
    useEffect(() => {
        if (variantsData) {
        // Auto-select first color and size when variants load or tshirt changes
        setSelectedColor(variantsData.colors[0] || null);
        setSelectedSize(variantsData.sizes[0] || null);
        } else {
        // Reset when no data (e.g., tshirt changed and new data is loading)
        setSelectedColor(null);
        setSelectedSize(null);
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
    setSelectedColor,
    setSelectedSize
    }
}
