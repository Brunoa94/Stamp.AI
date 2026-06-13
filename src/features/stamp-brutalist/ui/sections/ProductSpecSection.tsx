
"use client";

import { memo, useMemo, useCallback } from "react";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";
import { SectionHeader } from "../components/SectionHeader";
import { useTshirtProducts } from "@/queries/productQueries";
import { useBestProvidersForBlueprints } from "@/queries/providerCatalogQueries";
import { useStampNavigation } from "../../lib/hooks/useStampNavigation";
import type { TshirtType } from "@/types/product";

// Memoized product card component
const ProductCard = memo(function ProductCard({
  product,
  isSelected,
  onSelect,
}: {
  product: TshirtType & { fabricType: string; price: number };
  isSelected: boolean;
  onSelect: (product: TshirtType) => void;
}) {
  const handleClick = useCallback(() => {
    onSelect(product);
  }, [product, onSelect]);

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      className={cn(
        "border-2 rounded-none p-3 space-y-2 text-left transition-all duration-300 flex flex-col h-auto",
        "hover:shadow-xl hover:scale-[1.02]",
        isSelected
          ? "border-brandCyan bg-brandCyan/10 shadow-xl"
          : "border-ink/20 hover:border-brandCyan",
      )}
    >
      {/* Product Image */}
      {product.image && (
        <div className="relative w-full h-32 bg-paper/50">
          <img
            src={product.image}
            alt={product.fabricType}
            className="object-contain w-full h-full"
          />
        </div>
      )}

      {/* Product Title */}
      <h3 className="font-anton text-sm tracking-wider uppercase text-ink">
        {product.fabricType}
      </h3>

      {/* Price */}
      <div className="inline-flex items-center gap-2 px-2 py-1 bg-ink text-white">
        <span className="font-anton text-xs">
          {product.price > 0 ? `$${product.price.toFixed(2)}` : "Loading..."}
        </span>
      </div>
    </Button>
  );
});

export const ProductSpecSection = memo(function ProductSpecSection() {
  const { watch, setValue } = useFormContext<StampFormData>();
  const blueprintId = watch("blueprintId");
  const printProviderId = watch("printProviderId");

  const { data: products = [], isLoading: loadingProducts } =
    useTshirtProducts();

  // Extract blueprint IDs for pricing - memoized
  const blueprintIds = useMemo(
    () => products.map((p) => p.blueprint_id),
    [products],
  );

  // Fetch cheapest prices for all blueprints
  const { data: bestProviders, isLoading: isLoadingPrices } =
    useBestProvidersForBlueprints(blueprintIds, "NL");

  // Map catalog products with names and prices - memoized
  const catalogProducts = useMemo(() => {
    const fabricTypeNames = [
      "Premium Cotton",
      "Organic Cotton",
      "Eco Blend",
      "Soft Cotton",
    ];

    return products.map((product, index) => {
      const bestProvider = bestProviders?.get(product.blueprint_id);
      const priceInCents = bestProvider?.total_cost || 0;
      const priceInDollars = priceInCents / 100;

      // Fallback to a base price if no pricing data is available
      const FALLBACK_PRICE = 25.0;
      const displayPrice = priceInDollars > 0 ? priceInDollars : FALLBACK_PRICE;

      return {
        ...product,
        fabricType: fabricTypeNames[index] || product.name,
        price: displayPrice,
        providerName: bestProvider?.provider_name,
        providerId: bestProvider?.provider_id,
      };
    });
  }, [products, bestProviders]);

  const { goToStep } = useStampNavigation();

  // Stable callback for product selection
  const handleSelectCatalogProduct = useCallback(
    (product: TshirtType) => {
      setValue("blueprintId", product.blueprint_id);
      setValue("printProviderId", product.print_provider_id);
      setValue("selectedColor", undefined);
      setValue("selectedSize", undefined);

      // Navigate to color selection after product is selected
      goToStep(6);
    },
    [setValue, goToStep],
  );

  const selectedProduct = useMemo(
    () =>
      catalogProducts.find(
        (p) =>
          p.blueprint_id === blueprintId &&
          p.print_provider_id === printProviderId,
      ),
    [catalogProducts, blueprintId, printProviderId],
  );

  return (
    <section
      id="step-5"
      className="stamp-section p-8 lg:p-16 flex items-center"
    >
      {/* Background decorations */}
      <div className="section-bg-overlay">
        <div
          className="gradient-layer"
          style={{ animationDuration: "20s" }}
        ></div>
        <div
          className="blob w-[60vw] h-[60vw] bg-brandPurple/10 top-0 right-0"
          style={{ animation: "floatBlob 45s ease-in-out infinite" }}
        ></div>
      </div>

      <div className="max-w-6xl border-l-4 border-brandCyan/30 pl-8 md:pl-16 relative z-10">
        <SectionHeader
          stepNumber="05"
          title="Product"
          highlightedWord="Spec"
          accentColor="brandCyan"
        />

        <div className="mb-4">
          <Span className="font-anton text-lg tracking-wider uppercase text-brandCyan">
            Choose Your Product
          </Span>
        </div>

        {loadingProducts || isLoadingPrices ? (
          <div className="text-center py-8">
            <Span className="opacity-40">Loading products...</Span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {catalogProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedProduct?.id === product.id}
                onSelect={handleSelectCatalogProduct}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
});
