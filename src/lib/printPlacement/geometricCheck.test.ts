/**
 * Tests for Geometric Placement Check
 *
 * Pure function tests - no network calls.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateBoundingBox,
  isWithinSafeZone,
  calculateEffectiveDpi,
  calculateOptimalScale,
  verifyPlacementGeometrically,
  autoCorrectPlacement,
} from './geometricCheck';
import type { ArtworkDimensions, PrintAreaDimensions, PlacementParams, SafeZone } from './types';

// Test fixtures
// Use high-resolution artwork to pass DPI checks (min 150 DPI)
const SQUARE_ARTWORK: ArtworkDimensions = { width: 3000, height: 3000 };
const PORTRAIT_ARTWORK: ArtworkDimensions = { width: 2000, height: 6000 }; // 1:3
const LANDSCAPE_ARTWORK: ArtworkDimensions = { width: 6000, height: 2000 }; // 3:1

// Low-res artwork for DPI failure tests
const LOW_RES_ARTWORK: ArtworkDimensions = { width: 500, height: 500 };

const TSHIRT_PRINT_AREA: PrintAreaDimensions = {
  position: 'front',
  width: 3185,
  height: 3636,
};

const DEFAULT_SAFE_ZONE: SafeZone = {
  top: 0.03,
  bottom: 0.03,
  left: 0.03,
  right: 0.03,
};

const CENTERED_PLACEMENT: PlacementParams = {
  x: 0.5,
  y: 0.5,
  scale: 1.0,
  angle: 0,
};

describe('calculateBoundingBox', () => {
  it('calculates correct bounding box for centered square artwork at scale 1.0', () => {
    const bbox = calculateBoundingBox(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, CENTERED_PLACEMENT);

    // Scale 1.0 means artwork width = print area width (1.0 in relative units)
    // Artwork is square, so height in relative units = 1.0 * (3185/3636) * (1024/1024)
    const expectedHeight = (1.0 / 1) * (3185 / 3636); // ~0.876

    expect(bbox.left).toBeCloseTo(0.0);  // 0.5 - 0.5
    expect(bbox.right).toBeCloseTo(1.0); // 0.5 + 0.5
    expect(bbox.top).toBeCloseTo(0.5 - expectedHeight / 2, 2);
    expect(bbox.bottom).toBeCloseTo(0.5 + expectedHeight / 2, 2);
  });

  it('calculates correct bounding box for portrait artwork', () => {
    const bbox = calculateBoundingBox(PORTRAIT_ARTWORK, TSHIRT_PRINT_AREA, CENTERED_PLACEMENT);

    // Portrait artwork (1:3) will be taller than square
    const artworkAspect = 1024 / 3072; // 0.333
    const printAreaAspect = 3185 / 3636; // 0.876
    const expectedHeight = (1.0 / artworkAspect) * printAreaAspect; // Much taller

    expect(bbox.left).toBeCloseTo(0.0);
    expect(bbox.right).toBeCloseTo(1.0);
    // Portrait artwork extends well beyond print area
    expect(bbox.top).toBeLessThan(0);
    expect(bbox.bottom).toBeGreaterThan(1);
  });

  it('calculates correct bounding box for landscape artwork', () => {
    const bbox = calculateBoundingBox(LANDSCAPE_ARTWORK, TSHIRT_PRINT_AREA, CENTERED_PLACEMENT);

    // Landscape artwork (3:1) will be much shorter
    const artworkAspect = 3072 / 1024; // 3.0
    const printAreaAspect = 3185 / 3636; // 0.876
    const expectedHeight = (1.0 / artworkAspect) * printAreaAspect; // ~0.29

    expect(bbox.left).toBeCloseTo(0.0);
    expect(bbox.right).toBeCloseTo(1.0);
    expect(bbox.top).toBeCloseTo(0.5 - expectedHeight / 2, 2);
    expect(bbox.bottom).toBeCloseTo(0.5 + expectedHeight / 2, 2);
    // Landscape fits vertically
    expect(bbox.top).toBeGreaterThan(0);
    expect(bbox.bottom).toBeLessThan(1);
  });

  it('respects scale parameter', () => {
    const halfScalePlacement: PlacementParams = { ...CENTERED_PLACEMENT, scale: 0.5 };
    const bbox = calculateBoundingBox(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, halfScalePlacement);

    expect(bbox.left).toBeCloseTo(0.25);  // 0.5 - 0.25
    expect(bbox.right).toBeCloseTo(0.75); // 0.5 + 0.25
  });

  it('respects position offset', () => {
    const offsetPlacement: PlacementParams = { x: 0.3, y: 0.4, scale: 0.4, angle: 0 };
    const bbox = calculateBoundingBox(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, offsetPlacement);

    expect(bbox.left).toBeCloseTo(0.1);  // 0.3 - 0.2
    expect(bbox.right).toBeCloseTo(0.5); // 0.3 + 0.2
  });
});

describe('isWithinSafeZone', () => {
  it('returns pass for bounding box fully within safe zone', () => {
    const bbox = { left: 0.1, right: 0.9, top: 0.1, bottom: 0.9 };
    const result = isWithinSafeZone(bbox, DEFAULT_SAFE_ZONE);
    expect(result.pass).toBe(true);
  });

  it('fails when left edge clips', () => {
    const bbox = { left: 0.01, right: 0.5, top: 0.1, bottom: 0.9 };
    const result = isWithinSafeZone(bbox, DEFAULT_SAFE_ZONE);
    expect(result.pass).toBe(false);
    expect(result.reason).toContain('Left edge');
  });

  it('fails when right edge clips', () => {
    const bbox = { left: 0.5, right: 0.99, top: 0.1, bottom: 0.9 };
    const result = isWithinSafeZone(bbox, DEFAULT_SAFE_ZONE);
    expect(result.pass).toBe(false);
    expect(result.reason).toContain('Right edge');
  });

  it('fails when top edge clips', () => {
    const bbox = { left: 0.1, right: 0.9, top: 0.01, bottom: 0.5 };
    const result = isWithinSafeZone(bbox, DEFAULT_SAFE_ZONE);
    expect(result.pass).toBe(false);
    expect(result.reason).toContain('Top edge');
  });

  it('fails when bottom edge clips', () => {
    const bbox = { left: 0.1, right: 0.9, top: 0.5, bottom: 0.99 };
    const result = isWithinSafeZone(bbox, DEFAULT_SAFE_ZONE);
    expect(result.pass).toBe(false);
    expect(result.reason).toContain('Bottom edge');
  });
});

describe('calculateEffectiveDpi', () => {
  it('calculates correct DPI for 3000px artwork at scale 1.0', () => {
    const dpi = calculateEffectiveDpi(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, 1.0);
    // At scale 1.0, artwork fills print area width
    // physicalWidth = 3185 / 300 = 10.62 inches
    // effectiveDpi = 3000 / 10.62 = ~283 DPI
    expect(dpi).toBeGreaterThan(250);
    expect(dpi).toBeLessThan(320);
  });

  it('DPI increases when scale decreases', () => {
    const dpiScale1 = calculateEffectiveDpi(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, 1.0);
    const dpiScale05 = calculateEffectiveDpi(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, 0.5);

    // Smaller scale = smaller physical size = higher DPI
    expect(dpiScale05).toBeGreaterThan(dpiScale1);
  });

  it('DPI increases with larger artwork', () => {
    const largeArtwork: ArtworkDimensions = { width: 5000, height: 5000 };
    const dpiLarge = calculateEffectiveDpi(largeArtwork, TSHIRT_PRINT_AREA, 1.0);
    const dpiSmall = calculateEffectiveDpi(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, 1.0);

    expect(dpiLarge).toBeGreaterThan(dpiSmall);
  });

  it('low-res artwork has low DPI', () => {
    const dpi = calculateEffectiveDpi(LOW_RES_ARTWORK, TSHIRT_PRINT_AREA, 1.0);
    // 500px / 10.62 inches = ~47 DPI
    expect(dpi).toBeLessThan(150); // Below minimum
  });
});

describe('calculateOptimalScale', () => {
  it('calculates scale that fits square artwork in safe zone', () => {
    const scale = calculateOptimalScale(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, DEFAULT_SAFE_ZONE);

    // Verify the resulting scale actually fits
    const placement: PlacementParams = { x: 0.5, y: 0.5, scale, angle: 0 };
    const bbox = calculateBoundingBox(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, placement);
    const check = isWithinSafeZone(bbox, DEFAULT_SAFE_ZONE);

    expect(check.pass).toBe(true);
    expect(scale).toBeGreaterThan(0);
    expect(scale).toBeLessThanOrEqual(1);
  });

  it('calculates smaller scale for portrait artwork', () => {
    const scaleSquare = calculateOptimalScale(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, DEFAULT_SAFE_ZONE);
    const scalePortrait = calculateOptimalScale(PORTRAIT_ARTWORK, TSHIRT_PRINT_AREA, DEFAULT_SAFE_ZONE);

    // Portrait artwork needs smaller scale to fit height
    expect(scalePortrait).toBeLessThan(scaleSquare);
  });

  it('returns same scale for landscape artwork (width constrained)', () => {
    const scaleSquare = calculateOptimalScale(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, DEFAULT_SAFE_ZONE);
    const scaleLandscape = calculateOptimalScale(LANDSCAPE_ARTWORK, TSHIRT_PRINT_AREA, DEFAULT_SAFE_ZONE);

    // Landscape is width-constrained, similar to square
    expect(scaleLandscape).toBeCloseTo(scaleSquare, 1);
  });
});

describe('verifyPlacementGeometrically', () => {
  it('fails for square artwork at scale 1.0 on portrait print area', () => {
    // Scale 1.0 will overflow the safe zone
    const result = verifyPlacementGeometrically(
      SQUARE_ARTWORK,
      TSHIRT_PRINT_AREA,
      CENTERED_PLACEMENT,
      145
    );

    expect(result.pass).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('passes for properly scaled artwork', () => {
    const optimalScale = calculateOptimalScale(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, DEFAULT_SAFE_ZONE);
    const placement: PlacementParams = { x: 0.5, y: 0.5, scale: optimalScale, angle: 0 };

    const result = verifyPlacementGeometrically(
      SQUARE_ARTWORK,
      TSHIRT_PRINT_AREA,
      placement,
      145
    );

    expect(result.pass).toBe(true);
  });
});

describe('autoCorrectPlacement', () => {
  it('corrects scale 1.0 placement to fit within safe zone', () => {
    const result = autoCorrectPlacement(
      SQUARE_ARTWORK,
      TSHIRT_PRINT_AREA,
      CENTERED_PLACEMENT,
      145
    );

    expect(result.pass).toBe(true);
    expect(result.iterations).toBeGreaterThan(0);
    expect(result.placement.scale).toBeLessThan(1.0);
  });

  it('returns 0 iterations for already valid placement', () => {
    const optimalScale = calculateOptimalScale(SQUARE_ARTWORK, TSHIRT_PRINT_AREA, DEFAULT_SAFE_ZONE);
    const validPlacement: PlacementParams = { x: 0.5, y: 0.5, scale: optimalScale * 0.9, angle: 0 };

    const result = autoCorrectPlacement(
      SQUARE_ARTWORK,
      TSHIRT_PRINT_AREA,
      validPlacement,
      145
    );

    expect(result.pass).toBe(true);
    expect(result.iterations).toBe(0);
  });

  it('handles extreme portrait artwork', () => {
    const result = autoCorrectPlacement(
      PORTRAIT_ARTWORK,
      TSHIRT_PRINT_AREA,
      CENTERED_PLACEMENT,
      145
    );

    expect(result.pass).toBe(true);
    expect(result.placement.scale).toBeLessThan(0.5); // Needs significant scale down
  });

  it('handles extreme landscape artwork', () => {
    const result = autoCorrectPlacement(
      LANDSCAPE_ARTWORK,
      TSHIRT_PRINT_AREA,
      CENTERED_PLACEMENT,
      145
    );

    expect(result.pass).toBe(true);
  });

  it('respects anchor Y position for t-shirts', () => {
    const result = autoCorrectPlacement(
      SQUARE_ARTWORK,
      TSHIRT_PRINT_AREA,
      CENTERED_PLACEMENT,
      145
    );

    // T-shirt anchor is 0.45 (slightly higher than center)
    expect(result.placement.y).toBeCloseTo(0.45, 1);
  });
});
