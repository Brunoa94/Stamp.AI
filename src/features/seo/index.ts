/**
 * SEO Module - Centralized exports
 *
 * This module provides all SEO-related utilities for the application:
 * - Configuration constants
 * - JSON-LD structured data builders
 * - Metadata generation utilities
 * - StructuredData component
 */

// Configuration
export {
  SITE_URL,
  SITE_NAME,
  DEFAULT_LOCALE,
  BRAND_COLORS,
  SOCIAL_PROFILES,
  TWITTER_CONFIG,
  OG_IMAGE,
  TWITTER_IMAGE,
  ROUTE_SEO,
  NOINDEX_PATHS,
  DISALLOW_PATHS,
  BUSINESS_INFO,
  KEYWORDS,
  PAGE_KEYWORDS,
  VERIFICATION,
  APPLE_CONFIG,
  ALTERNATE_LANGUAGES,
} from "./config";

// JSON-LD Schema Builders
export {
  organizationSchema,
  webSiteSchema,
  webPageSchema,
  faqPageSchema,
  breadcrumbSchema,
  howToSchema,
  productSchema,
  serviceSchema,
  homepageSchema,
  pageSchema,
  type FaqEntry,
  type BreadcrumbItem,
  type HowToStep,
  type WebPageData,
  type ProductData,
} from "./jsonLd";

// Metadata Utilities
export {
  generatePageMetadata,
  generateRootMetadata,
  generateTitle,
  optimizeDescription,
  getCanonicalUrl,
  shouldNoindex,
  titleTemplate,
  PAGE_METADATA_CONFIGS,
  type PageMetadataOptions,
} from "./metadata";

// Components
export { StructuredData } from "./StructuredData";
