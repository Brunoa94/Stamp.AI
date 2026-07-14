import type { CuratedBlueprintI, ProductCategory } from "@/supabase/types/provider-catalog";

/**
 * Curated Printify Blueprints for Provider Catalog
 *
 * This file contains a smaller, focused list of products for:
 * - T-shirts (basic apparel)
 * - Hoodies (premium apparel)
 * - Tote bags (accessories)
 * - Mugs (small goods)
 *
 * Blueprint IDs are from Printify's catalog and support front/back printing
 * or all-over printing depending on the product type.
 */

export const CURATED_BLUEPRINTS: CuratedBlueprintI[] = [
  // T-SHIRTS
  {
    id: 12,
    category: 'tshirt',
    title: 'Unisex Jersey Short Sleeve Tee (Bella+Canvas 3001)',
    description: 'Premium soft cotton tee with front/back printing',
  },
  {
    id: 6,
    category: 'tshirt',
    title: 'Unisex Heavy Cotton Tee (Gildan 5000)',
    description: 'Classic heavy cotton tee with front/back printing',
  },
  {
    id: 478,
    category: 'tshirt',
    title: 'Kids Heavy Cotton Tee',
    description: 'Classic kids cotton tee with the same quality as adult sizes',
  },
  {
    id: 1159,
    category: 'tshirt',
    title: 'Unisex Midweight T-Shirt',
    description: 'Comfortable midweight unisex t-shirt',
  },

  // HOODIES
  {
    id: 145,
    category: 'hoodie',
    title: 'Unisex Heavy Blend Hoodie',
    description: 'Classic pullover hoodie with front/back printing',
  },

  // TOTE BAGS
  {
    id: 1389,
    category: 'totebag',
    title: 'Tote Bag',
    description: 'Canvas tote bag with custom printing',
  },

  // POSTERS
  {
    id: 157,
    category: 'poster',
    title: 'Premium Matte Vertical Poster',
    description: 'High-quality matte finish poster',
  },
  {
    id: 1525,
    category: 'poster',
    title: 'Matte Canvas Poster',
    description: 'Canvas-style poster with matte finish',
  },

  // MUGS
  {
    id: 553,
    category: 'mug',
    title: 'White Glossy Mug (11oz)',
    description: 'Ceramic mug with all-over printing',
  },
];

/**
 * Get all blueprint IDs for catalog fetching
 */
export function getCuratedBlueprintIds(): number[] {
  return CURATED_BLUEPRINTS.map((bp) => bp.id);
}

/**
 * Get blueprints by category
 */
export function getBlueprintsByCategory(category: ProductCategory): CuratedBlueprintI[] {
  return CURATED_BLUEPRINTS.filter((bp) => bp.category === category);
}

/**
 * Get blueprint by ID
 */
export function getCuratedBlueprintById(id: number): CuratedBlueprintI | undefined {
  return CURATED_BLUEPRINTS.find((bp) => bp.id === id);
}

/**
 * Get all unique categories
 */
export function getProductCategories(): ProductCategory[] {
  return ['tshirt', 'hoodie', 'totebag', 'poster', 'mug'];
}

// Export the blueprint IDs as a constant for use in edge functions
export const CURATED_BLUEPRINT_IDS = getCuratedBlueprintIds();
