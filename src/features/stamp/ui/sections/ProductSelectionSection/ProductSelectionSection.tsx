"use client";

import { useMemo } from "react";
import { useCatalogProducts } from "@/queries/catalogQueries";
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

  const catalogProducts = useMemo<CatalogProductMappedType[]>(
    () =>
      visibleProducts.map((product) => {
        // New flow: price comes from the product's precomputed
        // min_price_cents (cheapest available Printify Choice variant)
        // plus shipping, unless an admin selling-price override is set.
        const baseCents = product.min_price_cents || 0;
        const shippingCents = product.shipping_cents || 0;
        const totalCents =
          product.selling_price_cents ??
          (baseCents > 0 ? baseCents + shippingCents : 0);
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
    [visibleProducts],
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
