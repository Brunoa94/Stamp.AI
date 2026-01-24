import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { CatalogBlueprintT, VariantInfoT, PrintifyImageT } from "@/schemas/checkout";

export function useProductCustomizer() {
  const [catalogBlueprints, setCatalogBlueprints] = useState<CatalogBlueprintT[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<CatalogBlueprintT | null>(null);
  const [printProviderId, setPrintProviderId] = useState<number>(99);

  const [blueprintVariants, setBlueprintVariants] = useState<VariantInfoT[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [uploadedFrontImage, setUploadedFrontImage] = useState<PrintifyImageT | null>(null);
  const [uploadedBackImage, setUploadedBackImage] = useState<PrintifyImageT | null>(null);
  const [activePrintSide, setActivePrintSide] = useState<"front" | "back">("front");

  const [loading, setLoading] = useState(true);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFirstTryFront = useRef(true);
  const isFirstTryBack = useRef(true);
  const supabase = createClient();

  // Fetch catalog blueprints on mount
  useEffect(() => {
    async function fetchCatalogBlueprints() {
      try {
        const { data, error } = await supabase.functions.invoke("get-catalog-blueprints", {
          body: {},
        });

        if (error) throw new Error(error.message);
        if (!data.success) throw new Error(data.error || "Failed to fetch catalog blueprints");

        setCatalogBlueprints(data.blueprints);
        setPrintProviderId(data.printProviderId || 99);

        if (data.blueprints.length > 0) {
          setSelectedBlueprint(data.blueprints[0]);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load catalog";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalogBlueprints();
  }, [supabase]);

  // Fetch variants when blueprint changes
  useEffect(() => {
    if (!selectedBlueprint) return;

    async function fetchVariants() {
      if (!selectedBlueprint) return; // Additional check for TypeScript

      setLoadingVariants(true);
      setSelectedColor(null);
      setSelectedSize(null);
      setSelectedVariantId(null);

      try {
        const { data, error } = await supabase.functions.invoke("get-blueprint-variants", {
          body: {
            blueprint_id: selectedBlueprint.id,
            print_provider_id: printProviderId,
          },
        });

        if (error) throw new Error(error.message);
        if (!data.success) throw new Error(data.error || "Failed to fetch variants");

        setBlueprintVariants(data.variants);
        setAvailableColors(data.colors);
        setAvailableSizes(data.sizes);
      } catch (err) {
        console.error("Failed to fetch variants:", err);
        setBlueprintVariants([]);
        setAvailableColors([]);
        setAvailableSizes([]);
      } finally {
        setLoadingVariants(false);
      }
    }

    fetchVariants();
  }, [selectedBlueprint, printProviderId, supabase]);

  // Find variant ID when color and size are selected
  useEffect(() => {
    if (!selectedColor || !selectedSize || blueprintVariants.length === 0) {
      setSelectedVariantId(null);
      return;
    }

    const variant = blueprintVariants.find((v) => {
      const color = v.options.color || v.title.split(" / ")[0]?.trim();
      const size = v.options.size || v.title.split(" / ")[1]?.trim();
      return color === selectedColor && size === selectedSize;
    });

    setSelectedVariantId(variant?.id || null);
  }, [selectedColor, selectedSize, blueprintVariants]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (uploadedFrontImage?.preview_url) {
        URL.revokeObjectURL(uploadedFrontImage.preview_url);
      }
      if (uploadedBackImage?.preview_url) {
        URL.revokeObjectURL(uploadedBackImage.preview_url);
      }
    };
  }, [uploadedFrontImage?.preview_url, uploadedBackImage?.preview_url]);

  const getSizesForColor = (color: string) => {
    return blueprintVariants
      .filter((v) => {
        const variantColor = v.options.color || v.title.split(" / ")[0]?.trim();
        return variantColor === color;
      })
      .map((v) => v.options.size || v.title.split(" / ")[1]?.trim())
      .filter((size): size is string => !!size);
  };

  const handleFrontImageUpload = (file: File) => {
    if (uploadedFrontImage?.preview_url) {
      URL.revokeObjectURL(uploadedFrontImage.preview_url);
    }

    const printifyImage: PrintifyImageT = {
      id: `temp_${Date.now()}`,
      file_name: file.name,
      preview_url: URL.createObjectURL(file),
    };
    setUploadedFrontImage(printifyImage);
    setError(null);
  };

  const handleBackImageUpload = (file: File) => {
    if (uploadedBackImage?.preview_url) {
      URL.revokeObjectURL(uploadedBackImage.preview_url);
    }

    const printifyImage: PrintifyImageT = {
      id: `temp_${Date.now()}`,
      file_name: file.name,
      preview_url: URL.createObjectURL(file),
    };
    setUploadedBackImage(printifyImage);
    setError(null);
  };

  const removeFrontImage = () => {
    if (uploadedFrontImage?.preview_url) {
      URL.revokeObjectURL(uploadedFrontImage.preview_url);
    }
    setUploadedFrontImage(null);
  };

  const removeBackImage = () => {
    if (uploadedBackImage?.preview_url) {
      URL.revokeObjectURL(uploadedBackImage.preview_url);
    }
    setUploadedBackImage(null);
  };

  const incrementQuantity = () => setQuantity(quantity + 1);
  const decrementQuantity = () => setQuantity(Math.max(1, quantity - 1));

  return {
    // State
    catalogBlueprints,
    selectedBlueprint,
    printProviderId,
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

    // Actions
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
  };
}
