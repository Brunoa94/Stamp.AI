/**
 * Product Spec Section Constants
 */

export const PRODUCT_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1eee8'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%23444444' font-family='Arial, sans-serif' font-size='20'%3ENo image%3C/text%3E%3C/svg%3E";

export const EXCLUDED_BLUEPRINT_IDS = new Set([12]);

export const FALLBACK_PRICE = 25.0;

export const FABRIC_TYPE_NAMES = [
  "Premium Cotton",
  "Organic Cotton",
  "Eco Blend",
  "Soft Cotton",
] as const;
