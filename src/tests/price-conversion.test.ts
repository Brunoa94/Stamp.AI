/**
 * Price Conversion Tests
 *
 * Verify that all price conversion functions correctly convert dollars to cents
 */

import { describe, it, expect } from 'vitest';
import { mapCreateProductToCartInput } from '@/mappers/createProductToCartMapper';

describe('Price Conversion', () => {
  describe('mapCreateProductToCartInput', () => {
    it('should convert dollars to cents correctly', () => {
      const result = mapCreateProductToCartInput({
        productId: 'test-123',
        productTitle: 'Test Product',
        variantPrice: 25.99, // $25.99
        imageUrl: 'https://example.com/image.png',
        variantId: 'var-456',
      });

      expect(result.unit_price).toBe(2599); // 2599 cents = $25.99
    });

    it('should handle whole dollar amounts', () => {
      const result = mapCreateProductToCartInput({
        productId: 'test-123',
        productTitle: 'Test Product',
        variantPrice: 25.0, // $25.00
        imageUrl: 'https://example.com/image.png',
        variantId: 'var-456',
      });

      expect(result.unit_price).toBe(2500); // 2500 cents = $25.00
    });

    it('should handle cents correctly', () => {
      const result = mapCreateProductToCartInput({
        productId: 'test-123',
        productTitle: 'Test Product',
        variantPrice: 0.80, // $0.80
        imageUrl: 'https://example.com/image.png',
        variantId: 'var-456',
      });

      expect(result.unit_price).toBe(80); // 80 cents = $0.80
    });

    it('should round to nearest cent for floating point precision', () => {
      const result = mapCreateProductToCartInput({
        productId: 'test-123',
        productTitle: 'Test Product',
        variantPrice: 19.995, // $19.995 (rounds to $20.00)
        imageUrl: 'https://example.com/image.png',
        variantId: 'var-456',
      });

      expect(result.unit_price).toBe(2000); // Rounded to 2000 cents = $20.00
    });

    it('should always return an integer', () => {
      const testPrices = [0.80, 25.00, 29.99, 50.00, 99.99, 19.995];

      testPrices.forEach(price => {
        const result = mapCreateProductToCartInput({
          productId: 'test-123',
          productTitle: 'Test Product',
          variantPrice: price,
          imageUrl: 'https://example.com/image.png',
          variantId: 'var-456',
        });

        expect(Number.isInteger(result.unit_price)).toBe(true);
        expect(result.unit_price).toBeGreaterThan(0);
      });
    });

    it('should include all required cart input fields', () => {
      const result = mapCreateProductToCartInput({
        productId: 'test-123',
        productTitle: 'Test Product',
        variantPrice: 25.99,
        imageUrl: 'https://example.com/image.png',
        variantId: 'var-456',
      });

      expect(result).toHaveProperty('product_id', 'test-123');
      expect(result).toHaveProperty('product_name', 'Test Product');
      expect(result).toHaveProperty('quantity', 1);
      expect(result).toHaveProperty('unit_price', 2599);
      expect(result).toHaveProperty('custom_image_url', 'https://example.com/image.png');
      expect(result).toHaveProperty('variant_id', 'var-456');
    });
  });
});
