"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "@/features/dashboard/uploadImage/ImageUploader";

interface PrintifyImage {
  id: string;
  file_name: string;
  preview_url?: string;
}

interface ProductCustomizerProps {
  onCustomizationComplete: (customization: ProductCustomization) => void;
  onError?: (error: string) => void;
}

// Print area position type
export type PrintPosition =
  | "front"
  | "back"
  | "left_sleeve"
  | "right_sleeve"
  | "neck";

export interface ProductCustomization {
  product_id: string;
  variant_id: number;
  quantity: number;
  print_areas: {
    front?: string; // Printify image ID
    back?: string;
    left_sleeve?: string;
    right_sleeve?: string;
    neck?: string;
  };
  product_title: string;
  variant_title: string;
  price: number;
  preview_url?: string;
  blueprint_id?: number;
  print_provider_id?: number;
}

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  variants: Array<{
    id: number;
    title: string;
    price: number;
    is_enabled: boolean;
    is_available: boolean;
  }>;
  images: Array<{
    src: string;
    position: string;
  }>;
}

// Catalog blueprint from Printify API
interface CatalogBlueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
  printAreas: Array<{
    position: string;
    width: number;
    height: number;
  }>;
}

export default function ProductCustomizer({
  onCustomizationComplete,
  onError,
}: ProductCustomizerProps) {
  // Catalog blueprints (products that can be printed)
  const [catalogBlueprints, setCatalogBlueprints] = useState<
    CatalogBlueprint[]
  >([]);
  const [selectedCatalogBlueprint, setSelectedCatalogBlueprint] =
    useState<CatalogBlueprint | null>(null);
  const [printProviderId, setPrintProviderId] = useState<number>(99); // Printify Choice

  // Variants for selected blueprint
  interface VariantInfo {
    id: number;
    title: string;
    options: { color?: string; size?: string };
  }
  const [blueprintVariants, setBlueprintVariants] = useState<VariantInfo[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Selected color/size/variant
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);

  // Front and back image uploads
  const [uploadedFrontImage, setUploadedFrontImage] =
    useState<PrintifyImage | null>(null);
  const [uploadedBackImage, setUploadedBackImage] =
    useState<PrintifyImage | null>(null);
  const [activePrintSide, setActivePrintSide] = useState<"front" | "back">(
    "front"
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch catalog blueprints on mount
  useEffect(() => {
    async function fetchCatalogBlueprints() {
      try {
        const { data, error } = await supabase.functions.invoke(
          "get-catalog-blueprints",
          { body: {} }
        );

        if (error) throw new Error(error.message);
        if (!data.success)
          throw new Error(data.error || "Failed to fetch catalog blueprints");

        setCatalogBlueprints(data.blueprints);
        setPrintProviderId(data.printProviderId || 99);

        // Auto-select first blueprint
        if (data.blueprints.length > 0) {
          setSelectedCatalogBlueprint(data.blueprints[0]);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load catalog";
        setError(message);
        onError?.(message);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalogBlueprints();
  }, [supabase, onError]);

  // Fetch variants when a blueprint is selected
  useEffect(() => {
    if (!selectedCatalogBlueprint) return;

    async function fetchVariants() {
      setLoadingVariants(true);
      setSelectedColor(null);
      setSelectedSize(null);
      setSelectedVariantId(null);

      try {
        const { data, error } = await supabase.functions.invoke(
          "get-blueprint-variants",
          {
            body: {
              blueprint_id: selectedCatalogBlueprint!.id,
              print_provider_id: printProviderId,
            },
          }
        );

        if (error) throw new Error(error.message);
        if (!data.success)
          throw new Error(data.error || "Failed to fetch variants");

        setBlueprintVariants(data.variants);
        setAvailableColors(data.colors);
        setAvailableSizes(data.sizes);
      } catch (err) {
        console.error("Failed to fetch variants:", err);
        // Don't show error to user, just use empty variants
        setBlueprintVariants([]);
        setAvailableColors([]);
        setAvailableSizes([]);
      } finally {
        setLoadingVariants(false);
      }
    }

    fetchVariants();
  }, [selectedCatalogBlueprint, printProviderId, supabase]);

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

  // Get sizes available for the selected color
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
    // Convert File to PrintifyImage format (this would normally involve an upload to Printify)
    const printifyImage: PrintifyImage = {
      id: `temp_${Date.now()}`,
      file_name: file.name,
      preview_url: URL.createObjectURL(file)
    };
    setUploadedFrontImage(printifyImage);
    setError(null);
  };

  const handleBackImageUpload = (file: File) => {
    // Convert File to PrintifyImage format (this would normally involve an upload to Printify)
    const printifyImage: PrintifyImage = {
      id: `temp_${Date.now()}`,
      file_name: file.name,
      preview_url: URL.createObjectURL(file)
    };
    setUploadedBackImage(printifyImage);
    setError(null);
  };

  const handleSubmit = () => {
    if (
      !selectedCatalogBlueprint ||
      !uploadedFrontImage ||
      !selectedVariantId
    ) {
      setError(
        "Please select a product, color, size, and upload at least a front design"
      );
      return;
    }

    // Build print_areas object with available images
    const print_areas: ProductCustomization["print_areas"] = {};
    if (uploadedFrontImage) {
      print_areas.front = uploadedFrontImage.id;
    }
    if (uploadedBackImage) {
      print_areas.back = uploadedBackImage.id;
    }

    // Use selected variant
    const customization: ProductCustomization = {
      product_id: "", // Will be created
      variant_id: selectedVariantId,
      quantity,
      print_areas,
      product_title: selectedCatalogBlueprint.title,
      variant_title: `${selectedCatalogBlueprint.brand} ${selectedCatalogBlueprint.model}`,
      price: 25.0, // Default price, will be set by variant
      preview_url: uploadedFrontImage.preview_url,
      blueprint_id: selectedCatalogBlueprint.id,
      print_provider_id: printProviderId,
    };

    onCustomizationComplete(customization);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="ml-2 text-gray-600">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Step 1: Upload Design */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
            1
          </span>
          Upload Your Design
        </h3>

        {/* Front/Back Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActivePrintSide("front")}
            className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
              activePrintSide === "front"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            Front Design {uploadedFrontImage && "✓"}
          </button>
          <button
            onClick={() => setActivePrintSide("back")}
            className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
              activePrintSide === "back"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            Back Design {uploadedBackImage && "✓"} (Optional)
          </button>
        </div>

        {/* Front Uploader */}
        {activePrintSide === "front" && (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Upload your front design. This will be printed on the front of the
              product.
            </p>
            <ImageUploader
              onImageUpload={handleFrontImageUpload}
              uploadedImage={null}
              onRemoveImage={() => setUploadedFrontImage(null)}
            />
            {uploadedFrontImage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <p className="text-green-700 text-sm">
                  ✓ Front design: {uploadedFrontImage.file_name}
                </p>
                <button
                  onClick={() => setUploadedFrontImage(null)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {/* Back Uploader */}
        {activePrintSide === "back" && (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Upload your back design (optional). This will be printed on the
              back of the product.
            </p>
            <ImageUploader
              onImageUpload={handleBackImageUpload}
              uploadedImage={null}
              onRemoveImage={() => setUploadedBackImage(null)}
            />
            {uploadedBackImage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <p className="text-green-700 text-sm">
                  ✓ Back design: {uploadedBackImage.file_name}
                </p>
                <button
                  onClick={() => setUploadedBackImage(null)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {/* Summary of uploaded designs */}
        {(uploadedFrontImage || uploadedBackImage) && (
          <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Designs:
            </p>
            <div className="flex gap-4">
              {uploadedFrontImage && (
                <div className="text-center">
                  {uploadedFrontImage.preview_url && (
                    <img
                      src={uploadedFrontImage.preview_url}
                      alt="Front design"
                      className="w-16 h-16 object-contain border rounded mb-1"
                    />
                  )}
                  <span className="text-xs text-gray-500">Front</span>
                </div>
              )}
              {uploadedBackImage && (
                <div className="text-center">
                  {uploadedBackImage.preview_url && (
                    <img
                      src={uploadedBackImage.preview_url}
                      alt="Back design"
                      className="w-16 h-16 object-contain border rounded mb-1"
                    />
                  )}
                  <span className="text-xs text-gray-500">Back</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Select Product */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
            2
          </span>
          Choose Product Type
        </h3>

        {catalogBlueprints.length === 0 ? (
          <p className="text-gray-500">Loading available products...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalogBlueprints.map((blueprint) => (
              <div
                key={blueprint.id}
                onClick={() => setSelectedCatalogBlueprint(blueprint)}
                className={`cursor-pointer border rounded-lg p-4 transition-all ${
                  selectedCatalogBlueprint?.id === blueprint.id
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {blueprint.images?.[0] && (
                  <img
                    src={blueprint.images[0]}
                    alt={blueprint.title}
                    className="w-full h-32 object-contain mb-2"
                  />
                )}
                <h4 className="font-medium text-sm truncate">
                  {blueprint.title}
                </h4>
                <p className="text-gray-500 text-xs">{blueprint.brand}</p>
                <div className="mt-2 flex gap-1">
                  {blueprint.printAreas.map((area) => (
                    <span
                      key={area.position}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                    >
                      {area.position}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 3: Select Color & Size */}
      {selectedCatalogBlueprint && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
              3
            </span>
            Select Color & Size
          </h3>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              <strong>Selected:</strong> {selectedCatalogBlueprint.title}
            </p>
            <p className="text-blue-600 text-xs mt-1">
              {selectedCatalogBlueprint.brand} • Print areas:{" "}
              {selectedCatalogBlueprint.printAreas
                .map((a) => a.position)
                .join(", ")}
            </p>
          </div>

          {loadingVariants ? (
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Loading options...
            </div>
          ) : (
            <>
              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color ({availableColors.length} available)
                </label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedSize(null);
                      }}
                      className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                        selectedColor === color
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              {selectedColor && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getSizesForColor(selectedColor).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                          selectedSize === size
                            ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected summary */}
              {selectedColor && selectedSize && selectedVariantId && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  ✓ Selected: {selectedColor} / {selectedSize}
                </div>
              )}
            </>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary & Continue */}
      {selectedCatalogBlueprint && uploadedFrontImage && selectedVariantId && (
        <div className="bg-gray-50 border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="flex items-start gap-4">
            <div className="flex gap-2">
              {uploadedFrontImage.preview_url && (
                <div className="text-center">
                  <img
                    src={uploadedFrontImage.preview_url}
                    alt="Front design preview"
                    className="w-16 h-16 object-contain border rounded"
                  />
                  <span className="text-xs text-gray-500">Front</span>
                </div>
              )}
              {uploadedBackImage?.preview_url && (
                <div className="text-center">
                  <img
                    src={uploadedBackImage.preview_url}
                    alt="Back design preview"
                    className="w-16 h-16 object-contain border rounded"
                  />
                  <span className="text-xs text-gray-500">Back</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{selectedCatalogBlueprint.title}</p>
              <p className="text-gray-600 text-sm">
                {selectedColor} / {selectedSize}
              </p>
              <p className="text-gray-600 text-sm">Quantity: {quantity}</p>
              <p className="text-gray-500 text-xs mt-1">
                Print areas: Front{uploadedBackImage ? " + Back" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                ${(25.0 * quantity).toFixed(2)}
              </p>
              <p className="text-gray-500 text-xs">Est. price</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue to Checkout
          </button>
        </div>
      )}
    </div>
  );
}
