/**
 * Metadata Generation Utilities
 *
 * Centralized helpers for generating consistent, SEO-optimized metadata
 * across all pages. Follows best practices from top e-commerce sites.
 *
 * Key features:
 * - Consistent Open Graph and Twitter Card tags
 * - Proper canonical URL handling
 * - noindex/nofollow for private pages
 * - Structured title templates
 */

import { Metadata } from "next";
import {
  SITE_URL,
  SITE_NAME,
  OG_IMAGE,
  TWITTER_CONFIG,
  TWITTER_IMAGE,
  BRAND_COLORS,
  ALTERNATE_LANGUAGES,
  VERIFICATION,
  APPLE_CONFIG,
  PAGE_KEYWORDS,
  NOINDEX_PATHS,
} from "./config";

// ============================================================================
// Types
// ============================================================================

export interface PageMetadataOptions {
  /** Page title (will be appended with site name) */
  title: string;
  /** Meta description (150-160 chars recommended) */
  description: string;
  /** Page path (e.g., "/stamp" or "/cart") */
  path: string;
  /** Keywords array for meta keywords tag */
  keywords?: string[];
  /** Custom OG image URL (defaults to site OG image) */
  ogImage?: string;
  /** Custom OG image alt text */
  ogImageAlt?: string;
  /** Override noindex behavior */
  noindex?: boolean;
  /** Additional OpenGraph data */
  openGraph?: Partial<Metadata["openGraph"]>;
  /** Additional Twitter data */
  twitter?: Partial<Metadata["twitter"]>;
}

// ============================================================================
// Title Generation
// ============================================================================

/**
 * Generates a properly formatted page title
 * Pattern: "Page Title | Site Name" (under 60 chars for Google)
 */
export function generateTitle(pageTitle: string): string {
  const fullTitle = `${pageTitle} | ${SITE_NAME}`;
  // Truncate if too long (Google shows ~60 chars)
  if (fullTitle.length > 60) {
    return `${pageTitle.substring(0, 50)}... | ${SITE_NAME}`;
  }
  return fullTitle;
}

/**
 * Title template for Next.js metadata
 */
export const titleTemplate = {
  template: `%s | ${SITE_NAME}`,
  default: `${SITE_NAME} - Custom AI-Designed Clothes & Prints`,
};

// ============================================================================
// Description Helpers
// ============================================================================

/**
 * Truncates description to optimal length (150-160 chars)
 * Adds ellipsis if truncated
 */
export function optimizeDescription(description: string): string {
  if (description.length <= 160) return description;
  return description.substring(0, 157) + "...";
}

// ============================================================================
// URL Helpers
// ============================================================================

/**
 * Generates canonical URL for a page
 */
export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Checks if a path should be noindexed
 */
export function shouldNoindex(path: string): boolean {
  return NOINDEX_PATHS.some((pattern) => {
    if (pattern.endsWith("*")) {
      return path.startsWith(pattern.slice(0, -1));
    }
    return path === pattern;
  });
}

// ============================================================================
// Main Metadata Generator
// ============================================================================

/**
 * Generates complete metadata for a page
 *
 * @example
 * ```ts
 * export const metadata = generatePageMetadata({
 *   title: "AI Design Studio",
 *   description: "Create custom t-shirts with AI...",
 *   path: "/stamp",
 * });
 * ```
 */
export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    keywords = [],
    ogImage = OG_IMAGE.url,
    ogImageAlt = OG_IMAGE.alt,
    noindex,
    openGraph = {},
    twitter = {},
  } = options;

  const canonicalUrl = getCanonicalUrl(path);
  const optimizedDescription = optimizeDescription(description);
  const isNoindex = noindex ?? shouldNoindex(path);

  return {
    title,
    description: optimizedDescription,
    keywords: keywords.length > 0 ? keywords : undefined,

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        ALTERNATE_LANGUAGES.map((lang) => [
          lang.hrefLang,
          `${lang.href}${path}`,
        ])
      ),
    },

    // Robots
    robots: isNoindex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },

    // Open Graph
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title,
      description: optimizedDescription,
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          width: OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt: ogImageAlt,
          type: OG_IMAGE.type,
        },
      ],
      ...openGraph,
    },

    // Twitter Card
    twitter: {
      card: TWITTER_CONFIG.cardType,
      site: TWITTER_CONFIG.site,
      creator: TWITTER_CONFIG.creator,
      title,
      description: optimizedDescription,
      images: [
        {
          url: TWITTER_IMAGE.url,
          alt: TWITTER_IMAGE.alt,
        },
      ],
      ...twitter,
    },
  };
}

// ============================================================================
// Root Layout Metadata
// ============================================================================

/**
 * Generates metadata for the root layout
 * Includes all global SEO settings
 */
export function generateRootMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),

    // Title configuration
    title: titleTemplate,

    // Default description
    description:
      "Type a prompt or upload your own photo, then put it on good t-shirts, hoodies, and prints built to last.",

    // Keywords
    keywords: PAGE_KEYWORDS.home,

    // Authors
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,

    // Format detection (disable auto-linking of phone numbers, etc.)
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },

    // Verification codes
    verification: {
      google: VERIFICATION.google,
      yandex: VERIFICATION.yandex,
      other: {
        ...(VERIFICATION.bing && { "msvalidate.01": VERIFICATION.bing }),
        ...(VERIFICATION.pinterest && {
          "p:domain_verify": VERIFICATION.pinterest,
        }),
      },
    },

    // App configuration
    applicationName: SITE_NAME,
    generator: "Next.js",
    referrer: "origin-when-cross-origin",

    // Apple configuration
    appleWebApp: {
      capable: true,
      statusBarStyle: APPLE_CONFIG.statusBarStyle,
      title: APPLE_CONFIG.title,
    },

    // Icons (minimal - detailed icons should be in app/icon.tsx or public folder)
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },

    // Manifest
    manifest: "/manifest.json",

    // Category (for app stores/directories)
    category: "shopping",

    // Default Open Graph
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: titleTemplate.default,
      description:
        "Type a prompt or upload your own photo, then put it on good t-shirts, hoodies, and prints built to last.",
      images: [
        {
          url: OG_IMAGE.url,
          secureUrl: OG_IMAGE.secureUrl,
          width: OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt: OG_IMAGE.alt,
          type: OG_IMAGE.type,
        },
      ],
    },

    // Default Twitter Card
    twitter: {
      card: TWITTER_CONFIG.cardType,
      site: TWITTER_CONFIG.site,
      creator: TWITTER_CONFIG.creator,
      title: titleTemplate.default,
      description:
        "Type a prompt or upload your own photo, then put it on good t-shirts, hoodies, and prints built to last.",
      images: [
        {
          url: TWITTER_IMAGE.url,
          alt: TWITTER_IMAGE.alt,
        },
      ],
    },

    // Robots default
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    // Other meta tags
    other: {
      "theme-color": BRAND_COLORS.themeLight,
      "color-scheme": "light dark",
      "msapplication-TileColor": BRAND_COLORS.primary,
    },
  };
}

// ============================================================================
// Pre-built Page Metadata Configurations
// ============================================================================

/**
 * Pre-configured metadata for common pages
 * Use these as starting points for page-specific metadata
 */
export const PAGE_METADATA_CONFIGS = {
  home: {
    title: "Custom AI T-Shirt & Apparel Design",
    description:
      "Describe an idea, get a print-ready design in seconds, and put it on heavyweight clothes. No design skills needed — start for free.",
    path: "/",
    keywords: PAGE_KEYWORDS.home,
  },
  stamp: {
    title: "AI Design Studio — Create Your Print",
    description:
      "Upload a photo or describe your idea, choose a style, and let AI make print-ready designs. Adjust the product and order in minutes.",
    path: "/stamp",
    keywords: PAGE_KEYWORDS.stamp,
  },
  cart: {
    title: "Shopping Cart",
    description:
      "Review your custom AI-designed apparel before checkout. Free shipping on orders over $75.",
    path: "/cart",
    keywords: PAGE_KEYWORDS.cart,
    noindex: true,
  },
  checkout: {
    title: "Secure Checkout",
    description:
      "Complete your order for custom AI-designed apparel. Secure payment with Stripe and PayPal.",
    path: "/checkout",
    keywords: PAGE_KEYWORDS.checkout,
    noindex: true,
  },
  orders: {
    title: "My Orders",
    description:
      "Track your custom apparel orders and view order history. Real-time shipping updates.",
    path: "/orders",
    keywords: PAGE_KEYWORDS.orders,
    noindex: true,
  },
  dashboard: {
    title: "Design Dashboard",
    description:
      "View your saved designs, order history, and create new custom apparel with AI.",
    path: "/dashboard",
    keywords: PAGE_KEYWORDS.dashboard,
    noindex: true,
  },
  profile: {
    title: "My Profile",
    description:
      "Manage your account settings, shipping addresses, and preferences.",
    path: "/profile",
    keywords: PAGE_KEYWORDS.profile,
    noindex: true,
  },
  resetPassword: {
    title: "Reset Password",
    description: "Reset your Stamp AI account password securely.",
    path: "/reset-password",
    noindex: true,
  },
  notFound: {
    title: "Page Not Found",
    description:
      "The page you're looking for doesn't exist. Return to create custom AI-designed apparel.",
    path: "/404",
    noindex: true,
  },
} as const;
