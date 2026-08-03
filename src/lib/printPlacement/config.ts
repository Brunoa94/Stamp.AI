/**
 * Print Placement Configuration
 *
 * Per-product-type configuration for placement, safe zones, and DPI minimums.
 * These values are based on Printify API data and print industry standards.
 */

import type { ProductConfig, SafeZone } from './types';

// Default safe zone: 3% margin on all sides
const DEFAULT_SAFE_ZONE: SafeZone = {
  top: 0.03,
  bottom: 0.03,
  left: 0.03,
  right: 0.03,
};

// T-shirts: slightly higher anchor for chest placement
const TSHIRT_SAFE_ZONE: SafeZone = {
  top: 0.05,    // More margin at top (near collar)
  bottom: 0.03,
  left: 0.03,
  right: 0.03,
};

// Hoodies: more margin due to zipper and seams
const HOODIE_SAFE_ZONE: SafeZone = {
  top: 0.08,    // Hood attachment area
  bottom: 0.05,
  left: 0.05,
  right: 0.05,
};

// Mugs: avoid handle area (wrap-around)
const MUG_SAFE_ZONE: SafeZone = {
  top: 0.05,
  bottom: 0.05,
  left: 0.15,   // Handle side
  right: 0.15,  // Handle side
};

/**
 * Product configurations indexed by blueprint ID
 */
export const PRODUCT_CONFIGS: Record<number, ProductConfig> = {
  // T-Shirts
  145: {
    blueprintId: 145,
    name: 'Unisex Softstyle T-Shirt (Gildan 64000)',
    category: 'apparel',
    positions: ['front', 'back', 'neck'],
    defaultPosition: 'front',
    safeZone: TSHIRT_SAFE_ZONE,
    minDpi: 150,
    anchorY: 0.45,  // Slightly higher than center for chest
  },
  5: {
    blueprintId: 5,
    name: 'Unisex Cotton Crew Tee (Next Level)',
    category: 'apparel',
    positions: ['front', 'back', 'neck'],
    defaultPosition: 'front',
    safeZone: TSHIRT_SAFE_ZONE,
    minDpi: 150,
    anchorY: 0.45,
  },
  6: {
    blueprintId: 6,
    name: 'Unisex Heavy Cotton Tee (Gildan 5000)',
    category: 'apparel',
    positions: ['front', 'back', 'neck', 'left_sleeve', 'right_sleeve'],
    defaultPosition: 'front',
    safeZone: TSHIRT_SAFE_ZONE,
    minDpi: 150,
    anchorY: 0.45,
  },

  // Hoodies
  77: {
    blueprintId: 77,
    name: 'Unisex Heavy Blend Hoodie (Gildan)',
    category: 'apparel',
    positions: ['front', 'back', 'neck', 'left_sleeve', 'right_sleeve'],
    defaultPosition: 'front',
    safeZone: HOODIE_SAFE_ZONE,
    minDpi: 150,
    anchorY: 0.42,  // Higher due to hood
  },
  49: {
    blueprintId: 49,
    name: 'Unisex Heavy Blend Crewneck Sweatshirt',
    category: 'apparel',
    positions: ['front', 'back', 'neck', 'left_sleeve', 'right_sleeve'],
    defaultPosition: 'front',
    safeZone: TSHIRT_SAFE_ZONE,
    minDpi: 150,
    anchorY: 0.45,
  },

  // Tote Bags - center placement
  553: {
    blueprintId: 553,
    name: 'Cotton Tote Bag',
    category: 'tote',
    positions: ['front', 'back'],
    defaultPosition: 'front',
    safeZone: DEFAULT_SAFE_ZONE,
    minDpi: 150,
    anchorY: 0.5,
  },
};

/**
 * Get product config by blueprint ID, with fallback to defaults
 */
export function getProductConfig(blueprintId: number): ProductConfig {
  return PRODUCT_CONFIGS[blueprintId] || {
    blueprintId,
    name: `Blueprint ${blueprintId}`,
    category: 'apparel',
    positions: ['front'],
    defaultPosition: 'front',
    safeZone: DEFAULT_SAFE_ZONE,
    minDpi: 150,
  };
}

/**
 * Maximum iterations for auto-correction loop
 */
export const MAX_CORRECTION_ITERATIONS = 8;

/**
 * Safety margin to apply when scale-down still clips (percentage)
 */
export const ADDITIONAL_SAFETY_MARGIN = 0.02;

/**
 * Minimum scale to prevent images from becoming too small
 */
export const MIN_SCALE = 0.1;

/**
 * Rate limiting: milliseconds between API calls
 */
export const API_RATE_LIMIT_MS = 500;
