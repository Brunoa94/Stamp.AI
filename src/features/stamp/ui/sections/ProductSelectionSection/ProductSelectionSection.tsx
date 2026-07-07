"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useCatalogProducts } from "@/queries/catalogQueries";
import { CatalogQueryService } from "@/services/catalogQueryService";
import { useStampNavigation } from "../../../lib/hooks/useStampNavigation";
import { useStampProductSelection } from "../../../lib/hooks/useStampSelectors";
import { ProductGrid } from "./ProductGrid";
import { ProductSelectionContent } from "./ProductSelectionContent";
import type { CatalogProductMappedType } from "../../../lib/types/stampTypes";

/**
 * ProductSelectionSection
 *
 * Step 5: Select product canvas
 * Protocol 05 / Canvas
 *
 * Fetches products from the catalog_products table and enriches each with
 * the cheapest available print provider price, matching the stamp-brutalist pattern.
 */

const EXCLUDED_BLUEPRINT_IDS = new Set([12]);
const FALLBACK_PRICE = 25.0;
const PROVIDER_COUNTRY = "NL";

export function ProductSelectionSection() {
  const { nextStep } = useStampNavigation();
  const { blueprintId, printProviderId, setBlueprintId, setPrintProviderId } =
    useStampProductSelection();
  const canProceedToCustomization =
    blueprintId !== undefined && printProviderId !== undefined;

  const { data: rawProducts = [], isLoading, isError } = useCatalogProducts();

  const visibleProducts = useMemo(
    () =>
      rawProducts.filter(
        (product) => !EXCLUDED_BLUEPRINT_IDS.has(product.blueprint_id),
      ),
    [rawProducts],
  );

  const providerQueries = useQueries({
    queries: visibleProducts.map((product) => ({
      queryKey: ["catalog", "providers", product.id, PROVIDER_COUNTRY],
      queryFn: () =>
        CatalogQueryService.getProvidersForProduct(
          product.id,
          PROVIDER_COUNTRY,
        ),
      staleTime: 1000 * 60 * 10,
      enabled: !!product.id,
    })),
  });

  const catalogProducts = useMemo<CatalogProductMappedType[]>(
    () =>
      visibleProducts.map((product, index) => {
        const providers = providerQueries[index]?.data ?? [];
        const bestProvider = providers[0];
        const totalCents = bestProvider
          ? bestProvider.basePriceCents + bestProvider.shippingCostCents
          : 0;
        const price = totalCents > 0 ? totalCents / 100 : FALLBACK_PRICE;

        return {
          id: product.id,
          name: product.name,
          imageUrl: product.base_image_url ?? "",
          blueprintId: product.blueprint_id,
          printProviderId: bestProvider?.id ?? 0,
          price,
          providerName: bestProvider?.name,
          availabilityStatus: product.availability_status,
        };
      }),
    [visibleProducts, providerQueries],
  );

  const handleProductSelect = (product: CatalogProductMappedType) => {
    setBlueprintId(product.blueprintId);
    setPrintProviderId(product.printProviderId);
  };

  const handleClearSelection = () => {
    setBlueprintId(undefined);
    setPrintProviderId(undefined);
  };

  const isSelected = (product: CatalogProductMappedType) =>
    product.blueprintId === blueprintId &&
    product.printProviderId === printProviderId;

  const selectedProduct = catalogProducts.find(isSelected);

  return (
    <section
      id="step-5"
      className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2 border-b border-(--color-stamp-divider)"
    >
      <ProductSelectionContent
        canProceed={canProceedToCustomization}
        onContinue={nextStep}
      />
      <ProductGrid
        products={catalogProducts}
        selectedProduct={selectedProduct}
        isLoading={isLoading}
        isError={isError}
        onProductSelect={handleProductSelect}
        onClearSelection={handleClearSelection}
        isProductSelected={isSelected}
      />
    </section>
  );
}
