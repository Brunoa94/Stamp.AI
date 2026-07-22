/**
 * JSON-LD Structured Data Builders
 *
 * Schema.org structured data for rich search results. Following Google's
 * structured data guidelines for e-commerce:
 * https://developers.google.com/search/docs/appearance/structured-data
 *
 * Implemented schemas:
 * - Organization: Brand/company information
 * - WebSite: Site-level info with search action
 * - WebPage: Page-level metadata
 * - FAQPage: Frequently asked questions
 * - BreadcrumbList: Navigation breadcrumbs
 * - Product: Product information (for future use)
 * - HowTo: Step-by-step process
 *
 * Note: We only emit first-party, verifiable data. We intentionally do NOT
 * emit AggregateRating/Review data without real, verified reviews.
 */

import {
  SITE_URL,
  SITE_NAME,
  BUSINESS_INFO,
  SOCIAL_PROFILES,
} from "./config";

// ============================================================================
// Type Definitions
// ============================================================================

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export interface WebPageData {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}

// ============================================================================
// Organization Schema
// ============================================================================

/**
 * Organization schema - identifies the brand to search engines
 * Appears in Knowledge Panel and brand searches
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: BUSINESS_INFO.logo,
      contentUrl: BUSINESS_INFO.logo,
      caption: BUSINESS_INFO.name,
    },
    image: BUSINESS_INFO.image,
    description: BUSINESS_INFO.description,
    slogan: BUSINESS_INFO.slogan,
    foundingDate: BUSINESS_INFO.foundingDate,
    email: BUSINESS_INFO.email,
    sameAs: Object.values(SOCIAL_PROFILES),
    address: BUSINESS_INFO.address,
    areaServed: BUSINESS_INFO.areaServed,
    priceRange: BUSINESS_INFO.priceRange,
    currenciesAccepted: BUSINESS_INFO.currenciesAccepted,
    paymentAccepted: BUSINESS_INFO.paymentAccepted,
  };
}

// ============================================================================
// WebSite Schema
// ============================================================================

/**
 * WebSite schema - enables sitelinks search box in Google
 * https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
 */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: BUSINESS_INFO.description,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/stamp?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-US",
  };
}

// ============================================================================
// WebPage Schema
// ============================================================================

/**
 * WebPage schema - page-level structured data
 */
export function webPageSchema(data: WebPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${data.url}/#webpage`,
    name: data.name,
    description: data.description,
    url: data.url,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    about: {
      "@id": `${SITE_URL}/#organization`,
    },
    ...(data.datePublished && { datePublished: data.datePublished }),
    ...(data.dateModified && { dateModified: data.dateModified }),
    inLanguage: "en-US",
  };
}

// ============================================================================
// FAQ Schema
// ============================================================================

/**
 * FAQPage schema - enables FAQ rich results
 * https://developers.google.com/search/docs/appearance/structured-data/faqpage
 */
export function faqPageSchema(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: entries.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

// ============================================================================
// Breadcrumb Schema
// ============================================================================

/**
 * BreadcrumbList schema - shows page hierarchy in search results
 * https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ============================================================================
// HowTo Schema (for the design process)
// ============================================================================

/**
 * HowTo schema - explains the design process step by step
 * https://developers.google.com/search/docs/appearance/structured-data/how-to
 */
export function howToSchema(steps: HowToStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${SITE_URL}/#howto`,
    name: "How to Create Custom AI-Designed Apparel",
    description:
      "Create your own custom t-shirt or hoodie using AI in just a few simple steps. No design skills required.",
    totalTime: "PT10M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    tool: [
      {
        "@type": "HowToTool",
        name: "Web browser",
      },
    ],
    supply: [
      {
        "@type": "HowToSupply",
        name: "Your creative idea or reference image",
      },
    ],
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && {
        image: {
          "@type": "ImageObject",
          url: step.image,
        },
      }),
    })),
  };
}

// ============================================================================
// Product Schema (for individual products)
// ============================================================================

export interface ProductData {
  name: string;
  description: string;
  image: string;
  sku?: string;
  brand?: string;
  price?: number;
  priceCurrency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  url?: string;
}

/**
 * Product schema - for product pages
 * https://developers.google.com/search/docs/appearance/structured-data/product
 *
 * Note: Only use when displaying actual products with real pricing
 */
export function productSchema(product: ProductData) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    ...(product.sku && { sku: product.sku }),
    brand: {
      "@type": "Brand",
      name: product.brand ?? SITE_NAME,
    },
    ...(product.price && {
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: product.priceCurrency ?? "USD",
        availability: `https://schema.org/${product.availability ?? "InStock"}`,
        ...(product.url && { url: product.url }),
        seller: {
          "@id": `${SITE_URL}/#organization`,
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "USD",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "US",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 2,
              maxValue: 3,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 3,
              maxValue: 7,
              unitCode: "DAY",
            },
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          returnPolicyCategory:
            "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 30,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
      },
    }),
  };
}

// ============================================================================
// Service Schema (for the AI design service)
// ============================================================================

/**
 * Service schema - describes the AI design service
 */
export function serviceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/#service`,
    name: "AI Custom Apparel Design",
    description:
      "Create custom t-shirts, hoodies, and apparel using AI. Describe your idea in words, and our AI generates print-ready designs instantly.",
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
    serviceType: "Custom Apparel Design",
    areaServed: "Worldwide",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "AI Design Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI T-Shirt Design",
            description:
              "Generate custom t-shirt designs using AI from text prompts",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI Hoodie Design",
            description:
              "Generate custom hoodie designs using AI from text prompts",
          },
        },
      ],
    },
  };
}

// ============================================================================
// Combined Schema for Homepage
// ============================================================================

/**
 * Generates all structured data for the homepage in a single graph
 */
export function homepageSchema(faqEntries?: FaqEntry[]) {
  const schemas = [
    organizationSchema(),
    webSiteSchema(),
    webPageSchema({
      name: `${SITE_NAME} - Custom AI-Designed Clothes & Prints`,
      description: BUSINESS_INFO.description,
      url: SITE_URL,
    }),
    serviceSchema(),
  ];

  if (faqEntries && faqEntries.length > 0) {
    schemas.push(faqPageSchema(faqEntries));
  }

  return {
    "@context": "https://schema.org",
    "@graph": schemas.map((schema) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { "@context": _, ...rest } = schema;
      return rest;
    }),
  };
}

// ============================================================================
// Helper for generating page-specific schema
// ============================================================================

/**
 * Generates structured data for a specific page with breadcrumbs
 */
export function pageSchema(
  pageData: WebPageData,
  breadcrumbs: BreadcrumbItem[]
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      // Remove @context from nested schemas
      (() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { "@context": _, ...rest } = webPageSchema(pageData);
        return rest;
      })(),
      (() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { "@context": _, ...rest } = breadcrumbSchema(breadcrumbs);
        return rest;
      })(),
    ],
  };
}
