"use client";

import { useMemo } from "react";
import { useCatalogProducts } from "@/queries/catalogQueries";
import { getCuratedBlueprintById } from "@/lib/printify/curatedBlueprints";
import { useStampNavigation } from "../../../lib/hooks/useStampNavigation";
import {
  useStampProductSelection,
  useStampCustomization,
} from "../../../lib/hooks/useStampSelectors";
import { ProductGrid } from "./ProductGrid";
import { ProductSelectionContent } from "./ProductSelectionContent";
import type { CatalogProductMappedType } from "../../../lib/types/stampTypes";

// Clothing categories (apparel)
const CLOTHING_CATEGORIES = new Set(["tshirt", "hoodie"]);

// Keywords to detect clothing from product name if no category match
const CLOTHING_KEYWORDS = ["tee", "t-shirt", "shirt", "hoodie", "sweatshirt"];

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
const FALLBACK_PRICE = 25.0;

export function ProductSelectionSection() {
  const { nextStep } = useStampNavigation();
  const { blueprintId, printProviderId, setBlueprintId, setPrintProviderId } =
    useStampProductSelection();
  const { setSelectedPriceCents } = useStampCustomization();
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
          printProviderId: product.print_provider_id,
          price,
          providerName: product.print_provider_id === 99 ? "Printify Choice" : "Print Provider",
        };
      }),
    [visibleProducts],
  );

  // Group products into clothing (apparel) and accessories
  const { clothingProducts, accessoryProducts } = useMemo(() => {
    const clothing: CatalogProductMappedType[] = [];
    const accessories: CatalogProductMappedType[] = [];

    for (const product of catalogProducts) {
      const blueprint = getCuratedBlueprintById(product.blueprintId);
      const category = blueprint?.category;

      // Check category from curated blueprints first
      if (category && CLOTHING_CATEGORIES.has(category)) {
        clothing.push(product);
      } else if (category) {
        // Has a category but it's not clothing (e.g., totebag, poster, mug)
        accessories.push(product);
      } else {
        // No category match - use product name to determine
        const nameLower = product.name.toLowerCase();
        const isClothing = CLOTHING_KEYWORDS.some((keyword) =>
          nameLower.includes(keyword)
        );
        if (isClothing) {
          clothing.push(product);
        } else {
          accessories.push(product);
        }
      }
    }

    return { clothingProducts: clothing, accessoryProducts: accessories };
  }, [catalogProducts]);

  const handleProductSelect = (product: CatalogProductMappedType) => {
    setBlueprintId(product.blueprintId);
    setPrintProviderId(product.printProviderId);
    // Store price in cents (product.price is in dollars)
    setSelectedPriceCents(Math.round(product.price * 100));
  };

  const handleClearSelection = () => {
    setBlueprintId(undefined);
    setPrintProviderId(undefined);
    setSelectedPriceCents(undefined);
  };

  const isSelected = (product: CatalogProductMappedType) =>
    product.blueprintId === blueprintId &&
    product.printProviderId === printProviderId;

  const selectedProduct = catalogProducts.find(isSelected);

  return (
    <section
      id="step-5"
      className="h-full min-h-0 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 border-b border-(--color-stamp-divider)"
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
        isProductSelected={isSelected}
      />
    </section>
  );
}
