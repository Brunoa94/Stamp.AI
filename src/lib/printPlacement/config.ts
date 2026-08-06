/**
 * Print Placement Configuration
 *
 * Per-product-type configuration for placement, safe zones, and DPI minimums.
 * These values are based on Printify API data and print industry standards.
 */

import type { PlacementParams, ProductConfig, SafeZone } from './types';

export type CanvasOrientation = 'vertical' | 'horizontal' | 'square';

/**
 * Determine canvas orientation from size string (e.g., "10" x 20" (VERTICAL)")
 * Parses the dimensions and compares width vs height
 */
export function getCanvasOrientation(sizeString: string): CanvasOrientation {
  // Extract dimensions from formats like:
  // - "10" x 20" (VERTICAL)" or "10" x 8" (HORIZONTAL)"
  // - "12" x 12"" or "10×10"
  const cleanSize = sizeString
    .replace(/\(VERTICAL\)/gi, '')
    .replace(/\(HORIZONTAL\)/gi, '')
    .replace(/"/g, '')
    .replace(/×/g, 'x')
    .trim();

  const match = cleanSize.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) {
    return 'vertical'; // default
  }

  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);

  if (width === height) return 'square';
  if (width > height) return 'horizontal';
  return 'vertical';
}

/**
 * Detect product category from display title
 * Used as fallback when blueprint ID is not in PRODUCT_CONFIGS
 */
export function detectCategoryFromTitle(displayTitle: string): ProductConfig['category'] {
  const titleLower = displayTitle.toLowerCase();

  if (titleLower.includes('mug') || titleLower.includes('tumbler')) {
    return 'mug';
  }
  if (titleLower.includes('tote') || titleLower.includes('shopping bag')) {
    return 'tote';
  }
  if (titleLower.includes('sock')) {
    return 'socks';
  }
  if (titleLower.includes('canvas') || titleLower.includes('gallery wrap')) {
    return 'canvas';
  }
  if (titleLower.includes('poster') || titleLower.includes('art print') || titleLower.includes('wall art')) {
    return 'poster';
  }
  if (titleLower.includes('pillow') || titleLower.includes('cushion')) {
    return 'pillow';
  }

  // Default to apparel for t-shirts, hoodies, etc.
  return 'apparel';
}

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
  1525: {
    blueprintId: 1525,
    name: 'Unisex Heavy Blend Hoodie (Gildan 18500)',
    category: 'apparel',
    positions: ['front', 'back'],
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

  // AOP Tote Bag - very tall print area (2175x4350) wraps front+back
  // Client-side anchorY: 0.5 for centered mockup preview
  // Server-side uses different calculation for Printify (see edge function)
  // Always centered horizontally, only scale adjustment allowed
  1389: {
    blueprintId: 1389,
    name: 'AOP Tote Bag',
    category: 'tote',
    positions: ['front'],
    defaultPosition: 'front',
    safeZone: DEFAULT_SAFE_ZONE,
    minDpi: 150,
    anchorY: 0.5,
    scaleOnly: true,
  },

  // Mugs - placement disabled (wrap-around print, auto-centered)
  1320: {
    blueprintId: 1320,
    name: 'Ceramic Mug 11oz',
    category: 'mug',
    positions: ['front'],
    defaultPosition: 'front',
    safeZone: MUG_SAFE_ZONE,
    minDpi: 150,
    anchorY: 0.5,
    disablePlacementAdjustment: true,
  },
  468: {
    blueprintId: 468,
    name: 'White Glossy Mug',
    category: 'mug',
    positions: ['front'],
    defaultPosition: 'front',
    safeZone: MUG_SAFE_ZONE,
    minDpi: 150,
    anchorY: 0.5,
    disablePlacementAdjustment: true,
  },

  // Canvas - full bleed, center placement
  658: {
    blueprintId: 658,
    name: 'Matte Canvas',
    category: 'canvas',
    positions: ['front'],
    defaultPosition: 'front',
    safeZone: DEFAULT_SAFE_ZONE,
    minDpi: 150,
    anchorY: 0.5,
  },

  // Socks - all-over print on both legs, placement disabled
  462: {
    blueprintId: 462,
    name: 'Cushioned Crew Socks',
    category: 'socks',
    positions: ['left_leg', 'right_leg'],
    defaultPosition: 'left_leg',
    safeZone: DEFAULT_SAFE_ZONE,
    minDpi: 150,
    anchorY: 0.5,
    disablePlacementAdjustment: true,
  },
  496: {
    blueprintId: 496,
    name: 'Crew Socks',
    category: 'socks',
    positions: ['left_leg', 'right_leg'],
    defaultPosition: 'left_leg',
    safeZone: DEFAULT_SAFE_ZONE,
    minDpi: 150,
    anchorY: 0.5,
    disablePlacementAdjustment: true,
  },
};

/**
 * Sock face -> placement presets, per leg.
 *
 * Calibrated empirically against blueprint 496 / provider 26 mockups
 * (five probe products, 2026-08): the per-leg print file covers only the
 * FRONT panel of the sock — x maps straight (x=0.5 = front center, both
 * legs, angle unrotated) and the printable area never reaches the true back
 * of the leg. A dead-center back print is therefore physically impossible
 * on this blueprint.
 *
 * "back" here means the furthest outer-side placement the file allows
 * without clipping (x = 1 - scale/2, mirrored per leg) — on a worn sock the
 * design faces outward/sideways, the classic sock placement visible when
 * wearing shoes. For true back-of-leg prints a different blueprint with a
 * wraparound print area would be needed.
 */
export const SOCK_FACE_PLACEMENTS: Record<
  'left_leg' | 'right_leg',
  Record<'front' | 'back', PlacementParams>
> = {
  left_leg: {
    front: { x: 0.5, y: 0.35, scale: 0.45, angle: 0 },
    back: { x: 0.175, y: 0.35, scale: 0.35, angle: 0 },
  },
  right_leg: {
    front: { x: 0.5, y: 0.35, scale: 0.45, angle: 0 },
    back: { x: 0.825, y: 0.35, scale: 0.35, angle: 0 },
  },
};

/** Placement preset for a sock face choice on a specific leg. */
export function sockPlacementForFace(
  position: string,
  face: 'front' | 'back',
): PlacementParams {
  const leg =
    position === 'right_leg'
      ? SOCK_FACE_PLACEMENTS.right_leg
      : SOCK_FACE_PLACEMENTS.left_leg;
  return { ...leg[face] };
}

/**
 * Get product config by blueprint ID, with fallback to defaults.
 * Optionally accepts displayTitle to detect category for unknown blueprints.
 */
export function getProductConfig(blueprintId: number, displayTitle?: string): ProductConfig {
  const existingConfig = PRODUCT_CONFIGS[blueprintId];
  if (existingConfig) {
    return existingConfig;
  }

  // Detect category from display title if provided
  const category = displayTitle ? detectCategoryFromTitle(displayTitle) : 'apparel';

  // Apply category-specific defaults
  const isMug = category === 'mug';
  const isSocks = category === 'socks';
  const disablePlacement = isMug || isSocks;

  return {
    blueprintId,
    name: displayTitle || `Blueprint ${blueprintId}`,
    category,
    positions: ['front'],
    defaultPosition: 'front',
    safeZone: isMug ? MUG_SAFE_ZONE : DEFAULT_SAFE_ZONE,
    minDpi: 150,
    disablePlacementAdjustment: disablePlacement,
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
