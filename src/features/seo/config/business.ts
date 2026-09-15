import { SITE_URL, SITE_NAME } from "./site";
import { SOCIAL_PROFILES } from "./social";
import { LEGAL_ENTITY } from "@/features/legal/lib/constants/legalEntity";

/**
 * Business facts for structured data. Legal identity (name, country,
 * registered address, VAT id) is derived from LEGAL_ENTITY so the SEO output
 * can never contradict the legal pages. Fields that are `null` there are
 * still pending legal review and are omitted from JSON-LD by the mapper.
 */
export const BUSINESS_INFO = {
  name: SITE_NAME,
  legalName: LEGAL_ENTITY.legalName,
  description:
    "Turn a prompt or your own art into print-ready designs on custom clothes, printed on demand.",
  slogan: "Type an idea. Wear it tomorrow.",
  foundingDate: "2024",
  email: LEGAL_ENTITY.supportEmail,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og-image.jpg`,
  sameAs: Object.values(SOCIAL_PROFILES),
  address: {
    "@type": "PostalAddress" as const,
    addressCountry: LEGAL_ENTITY.countryCode,
    streetAddress: LEGAL_ENTITY.address,
  },
  /** EU VAT id; null until legal review provides it. */
  vatID: LEGAL_ENTITY.vat,
  /** KvK registration; null until legal review provides it. */
  taxID: LEGAL_ENTITY.registration,
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
};
