/**
 * Tests for Print Placement Configuration
 *
 * Tests for product config lookup, canvas orientation detection,
 * and placement adjustment flags.
 */

import { describe, it, expect } from 'vitest';
import {
  getProductConfig,
  getCanvasOrientation,
  detectCategoryFromTitle,
  PRODUCT_CONFIGS,
} from './config';

describe('getCanvasOrientation', () => {
  it('returns "vertical" for portrait dimensions', () => {
    expect(getCanvasOrientation('10" x 20" (VERTICAL)')).toBe('vertical');
    expect(getCanvasOrientation('8" x 12"')).toBe('vertical');
    expect(getCanvasOrientation('10×20')).toBe('vertical');
  });

  it('returns "horizontal" for landscape dimensions', () => {
    expect(getCanvasOrientation('20" x 10" (HORIZONTAL)')).toBe('horizontal');
    expect(getCanvasOrientation('16" x 12"')).toBe('horizontal');
    expect(getCanvasOrientation('24×18')).toBe('horizontal');
  });

  it('returns "square" for equal dimensions', () => {
    expect(getCanvasOrientation('12" x 12"')).toBe('square');
    expect(getCanvasOrientation('10×10')).toBe('square');
    expect(getCanvasOrientation('20" x 20" (SQUARE)')).toBe('square');
  });

  it('handles various format variations', () => {
    // Double quotes
    expect(getCanvasOrientation('10" x 20"')).toBe('vertical');
    // Unicode multiplication sign
    expect(getCanvasOrientation('10×20')).toBe('vertical');
    // With labels in parentheses
    expect(getCanvasOrientation('10" x 8" (HORIZONTAL)')).toBe('horizontal');
    // Extra whitespace
    expect(getCanvasOrientation('  10  x  20  ')).toBe('vertical');
  });

  it('returns "vertical" as default for unparseable input', () => {
    expect(getCanvasOrientation('unknown')).toBe('vertical');
    expect(getCanvasOrientation('')).toBe('vertical');
    expect(getCanvasOrientation('Large')).toBe('vertical');
  });
});

describe('detectCategoryFromTitle', () => {
  it('detects mug products', () => {
    expect(detectCategoryFromTitle('Ceramic Mug 11oz')).toBe('mug');
    expect(detectCategoryFromTitle('White Glossy Mug')).toBe('mug');
    expect(detectCategoryFromTitle('Stainless Steel Tumbler')).toBe('mug');
  });

  it('detects tote bag products', () => {
    expect(detectCategoryFromTitle('Cotton Tote Bag')).toBe('tote');
    expect(detectCategoryFromTitle('AOP Tote Bag')).toBe('tote');
    expect(detectCategoryFromTitle('Eco Shopping Bag')).toBe('tote');
  });

  it('detects socks products', () => {
    expect(detectCategoryFromTitle('Cushioned Crew Socks')).toBe('socks');
    expect(detectCategoryFromTitle('Athletic Socks')).toBe('socks');
  });

  it('detects canvas products', () => {
    expect(detectCategoryFromTitle('Matte Canvas')).toBe('canvas');
    expect(detectCategoryFromTitle('Gallery Wrap Canvas')).toBe('canvas');
  });

  it('detects poster products', () => {
    expect(detectCategoryFromTitle('Premium Poster')).toBe('poster');
    expect(detectCategoryFromTitle('Art Print')).toBe('poster');
    expect(detectCategoryFromTitle('Wall Art')).toBe('poster');
  });

  it('defaults to apparel for t-shirts and hoodies', () => {
    expect(detectCategoryFromTitle('Unisex Softstyle T-Shirt')).toBe('apparel');
    expect(detectCategoryFromTitle('Heavy Blend Hoodie')).toBe('apparel');
    expect(detectCategoryFromTitle('Crewneck Sweatshirt')).toBe('apparel');
  });
});

describe('PRODUCT_CONFIGS', () => {
  describe('AOP Tote Bag (blueprint 1389)', () => {
    it('has scaleOnly set to true (centered, only scale adjustable)', () => {
      const config = PRODUCT_CONFIGS[1389];
      expect(config).toBeDefined();
      expect(config.scaleOnly).toBe(true);
    });

    it('has category set to tote', () => {
      const config = PRODUCT_CONFIGS[1389];
      expect(config.category).toBe('tote');
    });

    it('has anchorY of 0.5 for centered mockup preview', () => {
      // Client-side uses 0.5 for centered preview
      // Server-side edge function handles different calculation for Printify
      const config = PRODUCT_CONFIGS[1389];
      expect(config.anchorY).toBe(0.5);
    });
  });

  describe('Mugs', () => {
    it('blueprint 1320 (Ceramic Mug 11oz) has disablePlacementAdjustment', () => {
      const config = PRODUCT_CONFIGS[1320];
      expect(config).toBeDefined();
      expect(config.disablePlacementAdjustment).toBe(true);
      expect(config.category).toBe('mug');
    });

    it('blueprint 468 (White Glossy Mug) has disablePlacementAdjustment', () => {
      const config = PRODUCT_CONFIGS[468];
      expect(config).toBeDefined();
      expect(config.disablePlacementAdjustment).toBe(true);
      expect(config.category).toBe('mug');
    });
  });

  describe('Socks', () => {
    it('blueprint 462 (Cushioned Crew Socks) has disablePlacementAdjustment', () => {
      const config = PRODUCT_CONFIGS[462];
      expect(config).toBeDefined();
      expect(config.disablePlacementAdjustment).toBe(true);
      expect(config.category).toBe('socks');
    });
  });

  describe('Canvas', () => {
    it('blueprint 658 (Matte Canvas) does NOT have disablePlacementAdjustment', () => {
      const config = PRODUCT_CONFIGS[658];
      expect(config).toBeDefined();
      expect(config.disablePlacementAdjustment).toBeUndefined();
      expect(config.category).toBe('canvas');
    });
  });

  describe('T-shirts and Hoodies', () => {
    it('apparel products do NOT have disablePlacementAdjustment', () => {
      // T-shirts
      expect(PRODUCT_CONFIGS[145].disablePlacementAdjustment).toBeUndefined();
      expect(PRODUCT_CONFIGS[5].disablePlacementAdjustment).toBeUndefined();
      expect(PRODUCT_CONFIGS[6].disablePlacementAdjustment).toBeUndefined();

      // Hoodies
      expect(PRODUCT_CONFIGS[77].disablePlacementAdjustment).toBeUndefined();
      expect(PRODUCT_CONFIGS[1525].disablePlacementAdjustment).toBeUndefined();
    });
  });
});

describe('getProductConfig', () => {
  it('returns config for known blueprint ID', () => {
    const config = getProductConfig(145);
    expect(config.blueprintId).toBe(145);
    expect(config.name).toBe('Unisex Softstyle T-Shirt (Gildan 64000)');
    expect(config.category).toBe('apparel');
  });

  it('returns config for AOP Tote Bag with scaleOnly mode', () => {
    const config = getProductConfig(1389);
    expect(config.scaleOnly).toBe(true);
    expect(config.category).toBe('tote');
  });

  it('returns default config for unknown blueprint ID', () => {
    const config = getProductConfig(99999);
    expect(config.blueprintId).toBe(99999);
    expect(config.category).toBe('apparel'); // default
    // For unknown apparel, placement adjustment is enabled (false)
    expect(config.disablePlacementAdjustment).toBe(false);
  });

  it('detects category from displayTitle for unknown blueprint', () => {
    const config = getProductConfig(99999, 'Custom Ceramic Mug');
    expect(config.category).toBe('mug');
    expect(config.disablePlacementAdjustment).toBe(true);
  });

  it('sets disablePlacementAdjustment for detected mug category', () => {
    const config = getProductConfig(99999, 'Travel Mug 15oz');
    expect(config.disablePlacementAdjustment).toBe(true);
  });

  it('sets disablePlacementAdjustment for detected socks category', () => {
    const config = getProductConfig(99999, 'Custom Athletic Socks');
    expect(config.disablePlacementAdjustment).toBe(true);
  });

  it('does NOT set disablePlacementAdjustment for canvas detected from title', () => {
    const config = getProductConfig(99999, 'Premium Matte Canvas');
    expect(config.category).toBe('canvas');
    // For canvas, placement adjustment is enabled (false)
    expect(config.disablePlacementAdjustment).toBe(false);
  });
});
