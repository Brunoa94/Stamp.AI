/**
 * Trust Metrics Constants
 *
 * Single source of truth for all trust-related numbers displayed across the site.
 * Ensures consistency between homepage, checkout, footer, and trust components.
 *
 * IMPORTANT: Update these values when actual metrics change.
 * All components should import from here rather than hardcoding values.
 */

/**
 * Review and rating metrics
 * Used by: TrustpilotWidget, HOME_RATING_SUMMARY, ReviewsRatingSummary
 */
export const TRUST_REVIEW_METRICS = {
  /** Overall rating across all platforms (out of 5) */
  overallRating: 4.8,
  /** Total number of verified reviews across all platforms */
  totalReviews: 1247,
  /** Platform-specific breakdown */
  platforms: {
    trustpilot: { rating: 4.9, reviews: 523 },
    google: { rating: 4.8, reviews: 412 },
    productHunt: { rating: 4.7, reviews: 312 },
  },
} as const;

/**
 * Order fulfillment metrics
 * Used by: OrdersFulfilledCounter
 */
export const TRUST_ORDER_METRICS = {
  /** Total orders fulfilled (rounded for display) */
  ordersFulfilled: 10000,
} as const;

/**
 * Guarantee policy values
 * Used by: TRUST_ITEMS, HomeTrustGuaranteesSection, legal pages
 *
 * IMPORTANT: These values must match the legal /returns policy.
 * The 30-day guarantee is the official policy per /returns page.
 */
export const TRUST_GUARANTEE_METRICS = {
  /** Money-back guarantee period in days */
  guaranteeDays: 30,
  /** Free shipping threshold in EUR */
  freeShippingThreshold: 60,
} as const;

/**
 * Trustpilot integration
 */
export const TRUSTPILOT_CONFIG = {
  /** URL to the Trustpilot review page */
  reviewUrl: "https://www.trustpilot.com/review/stamp.ai",
} as const;
