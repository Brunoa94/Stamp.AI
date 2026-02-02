import { useEffect, useState } from "react";
import { useBlueprintVariants } from "../../hooks/useBlueprintVariants";
import { TshirtType } from "@/features/dashboard/selectTshirt";

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
    if (variantsData && !selectedColor && variantsData.colors.length > 0) {
        setSelectedColor(variantsData.colors[0]);
    }
    if (variantsData && !selectedSize && variantsData.sizes.length > 0) {
        setSelectedSize(variantsData.sizes[0]);
    }
    }, [variantsData, selectedColor, selectedSize]);

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