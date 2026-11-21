"use client";

import { useMemo, memo } from "react";
import { useCatalogProductsWithSeo } from "@/shared/queries/catalogQueries";
import { usePrefetchBlueprintVariants } from "@/shared/queries/productQueries";
import { useProductText } from "@/shared/queries/productTextQueries";
import { mapStampProducts } from "../../../lib/mappers/stampProductMapper";
import { useStampNavigationActions } from "../../../lib/hooks/useStampNavigation";
import {
  useStampProductSelection,
  useStampCustomization,
} from "../../../lib/hooks/useStampSelectors";
import { isClothingProduct } from "../../../lib/helpers/productCategoryDetector";
import { ProductGrid } from "./ProductGrid";
import { ProductSelectionContent } from "./ProductSelectionContent";
import type { CatalogProductMappedT } from "../../../lib/types/stampTypes";
import { AnalyticsService } from "@/shared/services/analyticsService";
import { mapSelectItemEvent } from "@/features/analytics/lib/mappers/stampFlowMappers";

/**
 * ProductSelectionSection
 *
 * Step 5: Select product canvas
 * Protocol 05 / Canvas
 *
 * Fetches products from the catalog_products table with embedded pricing
 * Each product has its own print_provider_id (most use 99 = Printify Choice)
 */

const EXCLUDED_BLUEPRINT_IDS = new Set([12]);

function ProductSelectionSectionComponent() {
  const { nextStep } = useStampNavigationActions();
  const productText = useProductText();
  const {
    blueprintId,
    printProviderId,
    setBlueprintId,
    setPrintProviderId,
    setSelectedProductTitle,
    setSelectedProductDescription,
  } = useStampProductSelection();
  const { setSelectedPriceCents } = useStampCustomization();
  const canProceedToCustomization =
    blueprintId !== undefined && printProviderId !== undefined;

  const {
    data: rawProducts = [],
    isLoading,
    isError,
  } = useCatalogProductsWithSeo();

  const visibleProducts = useMemo(
    () =>
      rawProducts.filter(
        (product) => !EXCLUDED_BLUEPRINT_IDS.has(product.blueprint_id),
      ),
    [rawProducts],
  );

  const catalogProducts = useMemo<CatalogProductMappedT[]>(
    () => mapStampProducts(visibleProducts, productText),
    [visibleProducts, productText],
  );

  // Group products into clothing (apparel) and accessories based on display title
  const { clothingProducts, accessoryProducts } = useMemo(() => {
    const clothing: CatalogProductMappedT[] = [];
    const accessories: CatalogProductMappedT[] = [];

    for (const product of catalogProducts) {
      if (isClothingProduct(product.name)) {
        clothing.push(product);
      } else {
        accessories.push(product);
      }
    }

    return { clothingProducts: clothing, accessoryProducts: accessories };
  }, [catalogProducts]);

  // Prefetch variants (colors & sizes) for all products when grid loads
  usePrefetchBlueprintVariants(catalogProducts);

  const handleProductSelect = (product: CatalogProductMappedT) => {
    setBlueprintId(product.blueprintId);
    setPrintProviderId(product.printProviderId);
    setSelectedProductTitle(product.name);
    setSelectedProductDescription(product.description);
    // Store price in cents (product.price is in dollars)
    setSelectedPriceCents(Math.round(product.price * 100));

    AnalyticsService.track(
      "select_item",
      mapSelectItemEvent({
        blueprintId: product.blueprintId,
        productName: product.name,
        price: product.price,
      }),
    );
  };

  const handleClearSelection = () => {
    setBlueprintId(undefined);
    setPrintProviderId(undefined);
    setSelectedProductTitle(undefined);
    setSelectedProductDescription(undefined);
    setSelectedPriceCents(undefined);
  };

  const isSelected = (product: CatalogProductMappedT) =>
    product.blueprintId === blueprintId &&
    product.printProviderId === printProviderId;

  const selectedProduct = catalogProducts.find(isSelected);

  return (
    <section
      id="step-5"
      className="h-full min-h-0 overflow-hidden flex flex-col md:grid md:grid-cols-2 border-b border-(--color-stamp-divider)"
    >
      <ProductSelectionContent
        canProceed={canProceedToCustomization}
        onContinue={nextStep}
      />
      <ProductGrid
        clothingProducts={clothingProducts}
        accessoryProducts={accessoryProducts}
        selectedProduct={selectedProduct}
        isLoading={isLoading}
        isError={isError}
        onProductSelect={handleProductSelect}
        onClearSelection={handleClearSelection}
      />
    </section>
  );
}

export const ProductSelectionSection = memo(ProductSelectionSectionComponent);
