/**
 * Geometric Placement Check (Layer A)
 *
 * Deterministic, pure functions for calculating and verifying print placement.
 * No network calls - runs entirely on math.
 */

import type {
  PlacementParams,
  ArtworkDimensions,
  PrintAreaDimensions,
  BoundingBox,
  SafeZone,
  PlacementVerificationResult,
} from './types';
import { getProductConfig, MIN_SCALE, ADDITIONAL_SAFETY_MARGIN } from './config';

/**
 * Calculate the bounding box of artwork in print area coordinates (0-1 range)
 *
 * Printify coordinate system:
 * - x, y: center position of artwork (0.5, 0.5 = center of print area)
 * - scale: artwork width relative to print area width
 *   - scale=1.0 means artwork width = print area width
 *   - artwork height is scaled proportionally (preserving aspect ratio)
 */
export function calculateBoundingBox(
  artwork: ArtworkDimensions,
  printArea: PrintAreaDimensions,
  placement: PlacementParams
): BoundingBox {
  // Calculate artwork dimensions in print area coordinates
  const artworkAspect = artwork.width / artwork.height;
  const printAreaAspect = printArea.width / printArea.height;

  // Artwork width in print area units (0-1)
  const scaledArtworkWidth = placement.scale;

  // Artwork height in print area units, accounting for different aspect ratios
  // Since scale is relative to print area width, we need to convert
  const scaledArtworkHeight = (placement.scale / artworkAspect) * printAreaAspect;

  // Handle rotation (simplified - only 0, 90, 180, 270 degrees)
  let effectiveWidth = scaledArtworkWidth;
  let effectiveHeight = scaledArtworkHeight;

  if (placement.angle === 90 || placement.angle === 270) {
    effectiveWidth = scaledArtworkHeight;
    effectiveHeight = scaledArtworkWidth;
  }

  // Calculate bounding box edges from center position
  const halfWidth = effectiveWidth / 2;
  const halfHeight = effectiveHeight / 2;

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
export function isWithinSafeZone(
  boundingBox: BoundingBox,
  safeZone: SafeZone
): { pass: boolean; reason?: string } {
  const safeLeft = safeZone.left;
  const safeRight = 1 - safeZone.right;
  const safeTop = safeZone.top;
  const safeBottom = 1 - safeZone.bottom;

  if (boundingBox.left < safeLeft) {
    return { pass: false, reason: `Left edge clipped (${(boundingBox.left * 100).toFixed(1)}% < ${(safeLeft * 100).toFixed(1)}%)` };
  }
  if (boundingBox.right > safeRight) {
    return { pass: false, reason: `Right edge clipped (${(boundingBox.right * 100).toFixed(1)}% > ${(safeRight * 100).toFixed(1)}%)` };
  }
  if (boundingBox.top < safeTop) {
    return { pass: false, reason: `Top edge clipped (${(boundingBox.top * 100).toFixed(1)}% < ${(safeTop * 100).toFixed(1)}%)` };
  }
  if (boundingBox.bottom > safeBottom) {
    return { pass: false, reason: `Bottom edge clipped (${(boundingBox.bottom * 100).toFixed(1)}% > ${(safeBottom * 100).toFixed(1)}%)` };
  }

  return { pass: true };
}

/**
 * Calculate effective DPI of the printed artwork
 */
export function calculateEffectiveDpi(
  artwork: ArtworkDimensions,
  printArea: PrintAreaDimensions,
  scale: number,
  printDpi: number = 300  // Standard print DPI
): number {
  // Artwork is printed at: scale * printArea.width pixels wide
  const printedWidthPx = scale * printArea.width;

  // Physical size in inches (assuming print area is at printDpi)
  const physicalWidthInches = printArea.width / printDpi;

  // Effective DPI = artwork pixels / physical inches
  const effectiveDpi = artwork.width / (physicalWidthInches * scale);

  return Math.round(effectiveDpi);
}

/**
 * Calculate optimal scale to fit artwork within safe zone while preserving aspect ratio
 */
export function calculateOptimalScale(
  artwork: ArtworkDimensions,
  printArea: PrintAreaDimensions,
  safeZone: SafeZone
): number {
  const artworkAspect = artwork.width / artwork.height;
  const printAreaAspect = printArea.width / printArea.height;

  // Available safe zone dimensions
  const safeWidth = 1 - safeZone.left - safeZone.right;
  const safeHeight = 1 - safeZone.top - safeZone.bottom;

  // Calculate max scale constrained by width
  const maxScaleByWidth = safeWidth;

  // Calculate max scale constrained by height
  // scaledArtworkHeight = (scale / artworkAspect) * printAreaAspect
  // We need: scaledArtworkHeight <= safeHeight
  // So: scale <= safeHeight * artworkAspect / printAreaAspect
  const maxScaleByHeight = (safeHeight * artworkAspect) / printAreaAspect;

  // Use the smaller of the two to ensure fit
  const optimalScale = Math.min(maxScaleByWidth, maxScaleByHeight);

  return Math.max(MIN_SCALE, optimalScale);
}

/**
 * Calculate artwork height in print area units
 */
export function calculateArtworkHeightInPrintAreaUnits(
  artwork: ArtworkDimensions,
  printArea: PrintAreaDimensions,
  scale: number
): number {
  const artworkAspect = artwork.width / artwork.height;
  const printAreaAspect = printArea.width / printArea.height;
  return (scale / artworkAspect) * printAreaAspect;
}

/**
 * Calculate centered position within safe zone, accounting for artwork dimensions
 */
export function calculateCenteredPosition(
  safeZone: SafeZone,
  artworkHeightInPrintAreaUnits: number,
  anchorY?: number
): { x: number; y: number } {
  const safeLeft = safeZone.left;
  const safeRight = 1 - safeZone.right;
  const safeTop = safeZone.top;
  const safeBottom = 1 - safeZone.bottom;

  const centerX = (safeLeft + safeRight) / 2;

  // Calculate the range where artwork center can be placed
  const halfHeight = artworkHeightInPrintAreaUnits / 2;
  const minY = safeTop + halfHeight;
  const maxY = safeBottom - halfHeight;

  let centerY: number;

  if (minY > maxY) {
    // Artwork is too tall to fit, center it in safe zone
    centerY = (safeTop + safeBottom) / 2;
  } else if (anchorY !== undefined) {
    // Use anchor but clamp to valid range
    centerY = Math.max(minY, Math.min(maxY, anchorY));
  } else {
    // Default to center of valid range
    centerY = (minY + maxY) / 2;
  }

  return { x: centerX, y: centerY };
}

/**
 * Main geometric verification function
 */
export function verifyPlacementGeometrically(
  artwork: ArtworkDimensions,
  printArea: PrintAreaDimensions,
  placement: PlacementParams,
  blueprintId: number
): PlacementVerificationResult {
  const config = getProductConfig(blueprintId);

  // Calculate bounding box
  const boundingBox = calculateBoundingBox(artwork, printArea, placement);

  // Check safe zone
  const safeZoneCheck = isWithinSafeZone(boundingBox, config.safeZone);

  // Calculate effective DPI
  const effectiveDpi = calculateEffectiveDpi(artwork, printArea, placement.scale);

  // Check DPI minimum
  if (effectiveDpi < config.minDpi) {
    return {
      pass: false,
      placement,
      reason: `DPI too low: ${effectiveDpi} < ${config.minDpi} minimum`,
      boundingBox,
      effectiveDpi,
    };
  }

  if (!safeZoneCheck.pass) {
    return {
      pass: false,
      placement,
      reason: safeZoneCheck.reason,
      boundingBox,
      effectiveDpi,
    };
  }

  return {
    pass: true,
    placement,
    boundingBox,
    effectiveDpi,
  };
}

/**
 * Auto-correct placement to fit within safe zone
 *
 * Strategy (in order):
 * 1. Re-center: adjust x/y to move bounding box inside
 * 2. Scale down: reduce scale to fit
 * 3. Apply safety margin and retry
 */
export function correctPlacement(
  artwork: ArtworkDimensions,
  printArea: PrintAreaDimensions,
  currentPlacement: PlacementParams,
  blueprintId: number,
  iteration: number = 0
): PlacementVerificationResult {
  const config = getProductConfig(blueprintId);

  // Strategy 1: Calculate optimal scale first
  let scale = calculateOptimalScale(artwork, printArea, config.safeZone);

  // Apply additional safety margin on later iterations
  if (iteration > 0) {
    scale *= (1 - ADDITIONAL_SAFETY_MARGIN * iteration);
  }

  scale = Math.max(MIN_SCALE, scale);

  // Calculate artwork height for positioning
  const artworkHeight = calculateArtworkHeightInPrintAreaUnits(artwork, printArea, scale);

  // Strategy 2: Center position with optional anchor, accounting for artwork size
  const { x, y } = calculateCenteredPosition(config.safeZone, artworkHeight, config.anchorY);

  const correctedPlacement: PlacementParams = {
    x,
    y,
    scale,
    angle: currentPlacement.angle,
  };

  // Verify the corrected placement
  return verifyPlacementGeometrically(artwork, printArea, correctedPlacement, blueprintId);
}

/**
 * Run the full auto-correction loop
 */
export function autoCorrectPlacement(
  artwork: ArtworkDimensions,
  printArea: PrintAreaDimensions,
  initialPlacement: PlacementParams,
  blueprintId: number,
  maxIterations: number = 8
): PlacementVerificationResult {
  // First, verify initial placement
  let result = verifyPlacementGeometrically(artwork, printArea, initialPlacement, blueprintId);

  if (result.pass) {
    return { ...result, iterations: 0 };
  }

  // Iterate with corrections
  let lastPlacement = initialPlacement;

  for (let i = 0; i < maxIterations; i++) {
    result = correctPlacement(artwork, printArea, lastPlacement, blueprintId, i);

    if (result.pass) {
      return { ...result, iterations: i + 1 };
    }

    // Check if we're making progress (placement changed)
    if (
      result.placement.x === lastPlacement.x &&
      result.placement.y === lastPlacement.y &&
      result.placement.scale === lastPlacement.scale
    ) {
      // No progress, stop iterating
      return {
        ...result,
        iterations: i + 1,
        reason: `Correction loop stopped: no progress after ${i + 1} iterations. ${result.reason}`,
      };
    }

    lastPlacement = result.placement;
  }

  return {
    ...result,
    iterations: maxIterations,
    reason: `Max iterations (${maxIterations}) reached. ${result.reason}`,
  };
}
