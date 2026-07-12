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
 * Fetches products from the catalog_products table with embedded pricing
 * Uses Printify Choice (provider 99) - no multi-provider complexity
 */

const EXCLUDED_BLUEPRINT_IDS = new Set([12]);
const FALLBACK_PRICE = 25.0;
const PRINTIFY_CHOICE_PROVIDER_ID = 99;

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

  // Fetch variants with embedded pricing for each product
  const variantQueries = useQueries({
    queries: visibleProducts.map((product) => ({
      queryKey: ["catalog", "variants", product.blueprint_id],
      queryFn: () => CatalogQueryService.getProductVariants(product.blueprint_id),
      staleTime: 1000 * 60 * 10,
      enabled: !!product.blueprint_id,
    })),
  });

  const catalogProducts = useMemo<CatalogProductMappedType[]>(
    () =>
      visibleProducts.map((product, index) => {
        const variants = variantQueries[index]?.data ?? [];
        // Get cheapest variant price (or use min_price_cents from product)
        const minPriceCents = variants.length > 0
          ? Math.min(...variants.map(v => v.price_cents || 0).filter(p => p > 0))
          : product.min_price_cents || 0;

        const shippingCents = product.shipping_cents || 0;
        const totalCents = minPriceCents + shippingCents;
        const price = totalCents > 0 ? totalCents / 100 : FALLBACK_PRICE;

        return {
          blueprintId: product.blueprint_id,
          name: product.display_title,
          imageUrl: product.base_image_url ?? "",
          printProviderId: PRINTIFY_CHOICE_PROVIDER_ID,
          price,
          providerName: "Printify Choice",
        };
      }),
    [visibleProducts, variantQueries],
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
