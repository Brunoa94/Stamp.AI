/**
 * Print Placement Verification and Auto-Correction for Edge Functions
 *
 * This module provides geometric verification and auto-correction for print placement.
 * It's a Deno-compatible version of the placement logic used in the main app.
 */

// Types
interface PlacementParams {
  x: number;
  y: number;
  scale: number;
  angle: number;
}

interface ArtworkDimensions {
  width: number;
  height: number;
}

interface PrintAreaDimensions {
  position: string;
  width: number;
  height: number;
}

interface SafeZone {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface BoundingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface ProductConfig {
  safeZone: SafeZone;
  minDpi: number;
  anchorY?: number;
  maxScale?: number; // Limit max scale for products where smaller print looks better
}

interface PlacementResult {
  pass: boolean;
  placement: PlacementParams;
  reason?: string;
  effectiveDpi?: number;
  iterations?: number;
}

// Configuration
const MIN_SCALE = 0.1;
const ADDITIONAL_SAFETY_MARGIN = 0.02;
const MAX_ITERATIONS = 8;

// Product configurations
const PRODUCT_CONFIGS: Record<number, ProductConfig> = {
  // T-Shirts
  145: { safeZone: { top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.45 },
  5: { safeZone: { top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.45 },
  6: { safeZone: { top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.45 },
  // Hoodies
  77: { safeZone: { top: 0.08, bottom: 0.05, left: 0.05, right: 0.05 }, minDpi: 150, anchorY: 0.42 },
  49: { safeZone: { top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.45 },
  // Tote bags - center placement
  553: { safeZone: { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.5 },
  // AOP Tote Bag (all-over print, very tall 2175x4350 print area)
  // Anchor at 0.30 to place design in upper-center, maxScale 0.85 (~90% of 0.94)
  1389: { safeZone: { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 }, minDpi: 150, anchorY: 0.30, maxScale: 0.85 },
};

const DEFAULT_CONFIG: ProductConfig = {
  safeZone: { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 },
  minDpi: 150,
};

function getProductConfig(blueprintId: number): ProductConfig {
  return PRODUCT_CONFIGS[blueprintId] || DEFAULT_CONFIG;
}

/**
 * Calculate bounding box of artwork in print area coordinates (0-1 range)
 */
function calculateBoundingBox(
  artwork: ArtworkDimensions,
  printArea: PrintAreaDimensions,
  placement: PlacementParams
): BoundingBox {
  const artworkAspect = artwork.width / artwork.height;
  const printAreaAspect = printArea.width / printArea.height;

  const scaledWidth = placement.scale;
  let scaledHeight = (placement.scale / artworkAspect) * printAreaAspect;

  // Handle 90/270 degree rotation
  if (placement.angle === 90 || placement.angle === 270) {
    const temp = scaledHeight;
    scaledHeight = scaledWidth;
  }

  const halfWidth = scaledWidth / 2;
  const halfHeight = scaledHeight / 2;

  return {
    left: placement.x - halfWidth,
    right: placement.x + halfWidth,
    top: placement.y - halfHeight,
    bottom: placement.y + halfHeight,
  };
}

/**
 * Check if bounding box is within safe zone
 */
function isWithinSafeZone(bbox: BoundingBox, safeZone: SafeZone): { pass: boolean; reason?: string } {
  if (bbox.left < safeZone.left) {
    return { pass: false, reason: `Left edge clipped` };
  }
  if (bbox.right > 1 - safeZone.right) {
    return { pass: false, reason: `Right edge clipped` };
  }
  if (bbox.top < safeZone.top) {
    return { pass: false, reason: `Top edge clipped` };
  }
  if (bbox.bottom > 1 - safeZone.bottom) {
    return { pass: false, reason: `Bottom edge clipped` };
  }
  return { pass: true };
}

/**
 * Calculate effective DPI
 */
function calculateEffectiveDpi(
  artwork: ArtworkDimensions,
  printArea: PrintAreaDimensions,
  scale: number
): number {
  const physicalWidthInches = printArea.width / 300;
  return Math.round(artwork.width / (physicalWidthInches * scale));
}

/**
 * Calculate optimal scale to fit artwork within safe zone
 */
function calculateOptimalScale(
  artwork: ArtworkDimensions,
  printArea: PrintAreaDimensions,
  safeZone: SafeZone,
  maxScaleLimit?: number
): number {
  const artworkAspect = artwork.width / artwork.height;
  const printAreaAspect = printArea.width / printArea.height;

  const safeWidth = 1 - safeZone.left - safeZone.right;
  const safeHeight = 1 - safeZone.top - safeZone.bottom;

  const maxScaleByWidth = safeWidth;
  const maxScaleByHeight = (safeHeight * artworkAspect) / printAreaAspect;

  let optimalScale = Math.min(maxScaleByWidth, maxScaleByHeight);

  // Apply maxScale limit if configured (for products where smaller print looks better)
  if (maxScaleLimit !== undefined) {
    optimalScale = Math.min(optimalScale, maxScaleLimit);
  }

  return Math.max(MIN_SCALE, optimalScale);
}

/**
 * Calculate artwork height in print area units
 */
function calculateArtworkHeight(
  artwork: ArtworkDimensions,
  printArea: PrintAreaDimensions,
  scale: number
): number {
  const artworkAspect = artwork.width / artwork.height;
  const printAreaAspect = printArea.width / printArea.height;
  return (scale / artworkAspect) * printAreaAspect;
}

/**
 * Calculate centered position accounting for artwork size
 */
function calculateCenteredPosition(
  safeZone: SafeZone,
  artworkHeight: number,
  anchorY?: number
): { x: number; y: number } {
  const centerX = (safeZone.left + (1 - safeZone.right)) / 2;

  const halfHeight = artworkHeight / 2;
  const minY = safeZone.top + halfHeight;
  const maxY = (1 - safeZone.bottom) - halfHeight;

  let centerY: number;
  if (minY > maxY) {
    centerY = (safeZone.top + (1 - safeZone.bottom)) / 2;
  } else if (anchorY !== undefined) {
    centerY = Math.max(minY, Math.min(maxY, anchorY));
  } else {
    centerY = (minY + maxY) / 2;
  }

  return { x: centerX, y: centerY };
}

/**
 * Main auto-correction function
 *
 * @param artwork - Dimensions of the uploaded artwork
 * @param printArea - Dimensions of the print area
 * @param blueprintId - Blueprint ID for product-specific config
 * @returns Corrected placement parameters
 */
export function autoCorrectPlacement(
  artwork: ArtworkDimensions,
  printArea: PrintAreaDimensions,
  blueprintId: number
): PlacementResult {
  const config = getProductConfig(blueprintId);

  // Calculate optimal scale (respecting maxScale if configured)
  let scale = calculateOptimalScale(artwork, printArea, config.safeZone, config.maxScale);

  // Iterate with safety margin adjustments if needed
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (i > 0) {
      scale *= (1 - ADDITIONAL_SAFETY_MARGIN);
      scale = Math.max(MIN_SCALE, scale);
    }

    const artworkHeight = calculateArtworkHeight(artwork, printArea, scale);
    const { x, y } = calculateCenteredPosition(config.safeZone, artworkHeight, config.anchorY);

    const placement: PlacementParams = { x, y, scale, angle: 0 };
    const bbox = calculateBoundingBox(artwork, printArea, placement);
    const safeZoneCheck = isWithinSafeZone(bbox, config.safeZone);
    const effectiveDpi = calculateEffectiveDpi(artwork, printArea, scale);

    // Check DPI
    if (effectiveDpi < config.minDpi) {
      return {
        pass: false,
        placement,
        reason: `DPI too low: ${effectiveDpi} < ${config.minDpi}. Artwork resolution insufficient.`,
        effectiveDpi,
        iterations: i + 1,
      };
    }

    // Check safe zone
    if (safeZoneCheck.pass) {
      return {
        pass: true,
        placement,
        effectiveDpi,
        iterations: i + 1,
      };
    }
  }

  // Final fallback
  const artworkHeight = calculateArtworkHeight(artwork, printArea, scale);
  const { x, y } = calculateCenteredPosition(config.safeZone, artworkHeight, config.anchorY);

  return {
    pass: false,
    placement: { x, y, scale, angle: 0 },
    reason: `Could not fit artwork within safe zone after ${MAX_ITERATIONS} iterations`,
    iterations: MAX_ITERATIONS,
  };
}

/**
 * Calculate placement for given artwork and print area
 * This is the main function to call from the edge function
 */
export function calculatePlacement(
  artworkWidth: number,
  artworkHeight: number,
  printAreaWidth: number,
  printAreaHeight: number,
  blueprintId: number,
  position: string = 'front'
): { x: number; y: number; scale: number; angle: number } {
  const artwork: ArtworkDimensions = { width: artworkWidth, height: artworkHeight };
  const printArea: PrintAreaDimensions = { position, width: printAreaWidth, height: printAreaHeight };

  const result = autoCorrectPlacement(artwork, printArea, blueprintId);

  console.log(`📐 Placement calculation for blueprint ${blueprintId}:`, {
    artwork: `${artworkWidth}x${artworkHeight}`,
    printArea: `${printAreaWidth}x${printAreaHeight}`,
    result: {
      pass: result.pass,
      placement: result.placement,
      effectiveDpi: result.effectiveDpi,
      iterations: result.iterations,
    },
  });

  if (!result.pass) {
    console.warn(`⚠️ Placement warning: ${result.reason}`);
  }

  return result.placement;
}
