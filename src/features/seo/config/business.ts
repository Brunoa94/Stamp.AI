import { SITE_URL, SITE_NAME } from "./site";
import { SOCIAL_PROFILES } from "./social";

export const BUSINESS_INFO = {
  name: SITE_NAME,
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
