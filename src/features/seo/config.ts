/**
 * SEO Configuration - Enterprise E-commerce Best Practices
 *
 * This configuration follows SEO patterns from leading e-commerce sites:
 * - Shopify, ASOS, Nike, Amazon, Etsy, Zara
 *
 * Key SEO principles implemented:
 * 1. Unique, descriptive titles under 60 chars (Google truncates at ~60)
 * 2. Meta descriptions 150-160 chars with clear CTAs
 * 3. Open Graph & Twitter Cards for rich social sharing
 * 4. Structured data (JSON-LD) for rich search snippets
 * 5. Canonical URLs to prevent duplicate content issues
 * 6. Mobile-first viewport configuration
 * 7. Semantic HTML and accessibility considerations
 */

/** Public site origin. Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://stamp.ai";

/** Site name used across meta tags */
export const SITE_NAME = "Stamp AI";

/** Default locale for SEO */
export const DEFAULT_LOCALE = "en-US";

/** Supported locales for future internationalization */
export const SUPPORTED_LOCALES = ["en-US"] as const;

/** Brand colors for theme-color meta tags */
export const BRAND_COLORS = {
  primary: "#0a0a0a",
  secondary: "#ffffff",
  accent: "#ff6b00",
  themeLight: "#ffffff",
  themeDark: "#0a0a0a",
} as const;

/** Social media profiles for structured data */
export const SOCIAL_PROFILES = {
  twitter: "https://twitter.com/stampai",
  instagram: "https://instagram.com/stampai",
  linkedin: "https://linkedin.com/company/stampai",
  tiktok: "https://tiktok.com/@stampai",
} as const;

/** Twitter/X configuration */
export const TWITTER_CONFIG = {
  handle: "stampai",
  site: "@stampai",
  creator: "@stampai",
  cardType: "summary_large_image" as const,
} as const;

/** Default Open Graph image configuration (1200x630 recommended) */
export const OG_IMAGE = {
  url: `${SITE_URL}/og-image.jpg`,
  secureUrl: `${SITE_URL}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: "Stamp AI - Create Custom AI-Designed Apparel",
  type: "image/jpeg",
} as const;

/** Twitter card image (can be same as OG or different) */
export const TWITTER_IMAGE = {
  url: `${SITE_URL}/twitter-card.jpg`,
  alt: "Stamp AI - AI-Powered Custom T-Shirt Design",
} as const;

/**
 * Route SEO configurations
 * Each route has its own metadata configuration
 */
export const ROUTE_SEO = {
  home: {
    path: "/",
    priority: 1.0,
    changefreq: "daily" as const,
    index: true,
  },
  stamp: {
    path: "/stamp",
    priority: 0.9,
    changefreq: "weekly" as const,
    index: true,
  },
  cart: {
    path: "/cart",
    priority: 0.3,
    changefreq: "monthly" as const,
    index: false, // Protected route, no indexing
  },
  checkout: {
    path: "/checkout",
    priority: 0.3,
    changefreq: "monthly" as const,
    index: false, // Protected route, no indexing
  },
  orders: {
    path: "/orders",
    priority: 0.4,
    changefreq: "monthly" as const,
    index: false, // Protected route, no indexing
  },
  dashboard: {
    path: "/dashboard",
    priority: 0.4,
    changefreq: "monthly" as const,
    index: false, // Protected route, no indexing
  },
  profile: {
    path: "/profile",
    priority: 0.3,
    changefreq: "monthly" as const,
    index: false, // Protected route, no indexing
  },
  resetPassword: {
    path: "/reset-password",
    priority: 0.2,
    changefreq: "yearly" as const,
    index: false, // Utility page, no indexing
  },
  authCodeError: {
    path: "/auth/auth-code-error",
    priority: 0.1,
    changefreq: "yearly" as const,
    index: false, // Error page, no indexing
  },
} as const;

/**
 * Pages that should not be indexed by search engines
 */
export const NOINDEX_PATHS = [
  "/cart",
  "/checkout",
  "/checkout/*",
  "/orders",
  "/dashboard",
  "/profile",
  "/reset-password",
  "/auth/*",
] as const;

/**
 * Paths to disallow in robots.txt
 */
export const DISALLOW_PATHS = [
  "/api/",
  "/checkout/",
  "/cart",
  "/orders",
  "/dashboard",
  "/profile",
  "/reset-password",
  "/auth/",
  "/_next/",
  "/private/",
] as const;

/**
 * Business information for structured data (Schema.org Organization)
 */
export const BUSINESS_INFO = {
  name: "Stamp AI",
  legalName: "Stamp AI Design Inc.",
  description:
    "Turn a prompt or your own art into print-ready designs on custom clothes, printed on demand.",
  slogan: "Type an idea. Wear it tomorrow.",
  foundingDate: "2024",
  email: "support@stamp.ai",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og-image.jpg`,
  sameAs: Object.values(SOCIAL_PROFILES),
  address: {
    "@type": "PostalAddress" as const,
    addressCountry: "US",
  },
  priceRange: "$$",
  currenciesAccepted: "USD, EUR, GBP",
  paymentAccepted: "Credit Card, PayPal, Apple Pay, Google Pay",
  areaServed: "Worldwide",
  hasOfferCatalog: {
    "@type": "OfferCatalog" as const,
    name: "Custom AI-Designed Apparel",
    itemListElement: [
      {
        "@type": "Offer" as const,
        itemOffered: {
          "@type": "Product" as const,
          name: "Custom AI T-Shirts",
        },
      },
      {
        "@type": "Offer" as const,
        itemOffered: {
          "@type": "Product" as const,
          name: "Custom AI Hoodies",
        },
      },
    ],
  },
} as const;

/**
 * Keywords organized by intent (for meta tags and content optimization)
 */
export const KEYWORDS = {
  // Primary brand keywords (highest priority)
  primary: [
    "AI t-shirt design",
    "custom AI apparel",
    "AI t-shirt generator",
    "print on demand",
  ],
  // Product-focused keywords
  product: [
    "custom t-shirts",
    "custom hoodies",
    "personalized apparel",
    "heavyweight t-shirts",
    "premium print quality",
  ],
  // Action-oriented keywords (conversions)
  transactional: [
    "design your own t-shirt",
    "create custom t-shirt online",
    "order custom apparel",
    "buy custom t-shirts",
  ],
  // Informational keywords (awareness)
  informational: [
    "how to design t-shirts with AI",
    "AI clothing design",
    "text to t-shirt",
    "AI image to apparel",
  ],
  // Long-tail keywords (specific intent)
  longTail: [
    "AI generated t-shirt designs",
    "custom heavyweight t-shirts online",
    "made to order AI apparel",
    "carbon neutral custom clothing",
  ],
} as const;

/**
 * Page-specific keyword mappings
 */
export const PAGE_KEYWORDS = {
  home: [
    ...KEYWORDS.primary,
    ...KEYWORDS.product,
    "AI design generator",
    "custom hoodies",
  ],
  stamp: [
    "AI design studio",
    "create custom t-shirt",
    "text to t-shirt design",
    "AI image to apparel",
    "custom print maker",
    "design t-shirt online",
  ],
  cart: ["shopping cart", "review order", "custom apparel checkout"],
  checkout: ["secure checkout", "order confirmation", "safe payment"],
  orders: ["order history", "track order", "order status", "my orders"],
  dashboard: ["design dashboard", "my designs", "saved creations"],
  profile: ["account settings", "user profile", "shipping address"],
} as const;

/**
 * Verification codes for search engine webmaster tools
 * Set these in your environment variables
 */
export const VERIFICATION = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  pinterest: process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION,
} as const;

/**
 * Apple/iOS Web App configuration
 */
export const APPLE_CONFIG = {
  capable: "yes" as const,
  statusBarStyle: "black-translucent" as const,
  title: SITE_NAME,
  touchIcon: `${SITE_URL}/apple-touch-icon.png`,
} as const;

/**
 * Microsoft/Windows configuration
 */
export const MS_CONFIG = {
  tileColor: BRAND_COLORS.primary,
  tileImage: `${SITE_URL}/mstile-144x144.png`,
} as const;

/**
 * Alternate language versions (for hreflang tags)
 */
export const ALTERNATE_LANGUAGES = [
  { hrefLang: "en-US", href: SITE_URL },
  { hrefLang: "x-default", href: SITE_URL },
] as const;

/**
 * Common CTA phrases for meta descriptions
 */
export const CTA_PHRASES = {
  home: "Start for free today",
  stamp: "Create your design now",
  general: "No design skills needed",
  urgency: "Ships in 5-7 days",
  trust: "30-day guarantee",
} as const;
