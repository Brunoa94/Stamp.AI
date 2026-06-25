"use client";

import { memo, useMemo, useCallback } from "react";
import { useQueries } from "@tanstack/react-query";
import { Span } from "@/features/ui/span";
import { useFormContext } from "react-hook-form";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";
import { SectionHeader } from "../components/SectionHeader";
import { ProductSpecCard } from "../components/ProductSpecCard";
import { useCatalogProducts } from "@/queries/catalogQueries";
import { useStampNavigation } from "../../lib/hooks/useStampNavigation";
import { CatalogQueryService } from "@/services/catalogQueryService";
import type { StampCatalogProduct } from "../../lib/types/catalogProduct";
import {
  EXCLUDED_BLUEPRINT_IDS,
  FALLBACK_PRICE,
  FABRIC_TYPE_NAMES,
} from "../../lib/constants/productSpec";

export const ProductSpecSection = memo(function ProductSpecSection() {
  const { watch, setValue } = useFormContext<StampFormData>();
  const blueprintId = watch("blueprintId");
  const printProviderId = watch("printProviderId");

  const { data: products = [], isLoading: loadingProducts } =
    useCatalogProducts();

  const visibleProducts = useMemo(
    () =>
      products.filter(
        (product) => !EXCLUDED_BLUEPRINT_IDS.has(product.blueprint_id),
      ),
    [products],
  );

  const providerQueries = useQueries({
    queries: visibleProducts.map((product) => ({
      queryKey: ["catalog", "providers", product.id, "NL"],
      queryFn: () =>
        CatalogQueryService.getProvidersForProduct(product.id, "NL"),
      staleTime: 1000 * 60 * 10,
      enabled: !!product.id,
    })),
  });

  const isLoadingPrices = providerQueries.some((query) => query.isLoading);

  // Map catalog products with names and prices - memoized
  const catalogProducts = useMemo(() => {
    return visibleProducts.map((product, index) => {
      const providers = providerQueries[index]?.data || [];
      const bestProvider = providers[0];
      const totalPriceCents = bestProvider
        ? bestProvider.basePriceCents + bestProvider.shippingCostCents
        : 0;
      const priceInDollars = totalPriceCents / 100;

      const displayPrice = priceInDollars > 0 ? priceInDollars : FALLBACK_PRICE;

      return {
        id: product.id,
        name: product.name,
        image: product.base_image_url || "",
        blueprint_id: product.blueprint_id,
        print_provider_id: bestProvider?.id || 0,
        fabricType: FABRIC_TYPE_NAMES[index] || product.name,
        price: displayPrice,
        providerName: bestProvider?.name,
        availabilityStatus: product.availability_status,
      };
    });
  }, [visibleProducts, providerQueries]);

  const { goToStep } = useStampNavigation();

  // Stable callback for product selection
  const handleSelectCatalogProduct = useCallback(
    (product: StampCatalogProduct) => {
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
              <ProductSpecCard
                key={product.id}
                product={product}
                isSelected={selectedProduct?.id === product.id}
                disabled={!product.print_provider_id}
                onSelect={handleSelectCatalogProduct}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
});
