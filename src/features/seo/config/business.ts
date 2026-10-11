import { SITE_URL, SITE_NAME } from "./site";
import { SOCIAL_PROFILES } from "./social";
import {
  isPendingLegalValue,
  LEGAL_ENTITY,
} from "@/features/legal/lib/constants/legalEntity";

/** A legal value for JSON-LD, or undefined (omitted) while it is pending review. */
function confirmed(value: string): string | undefined {
  return isPendingLegalValue(value) ? undefined : value;
}

export const BUSINESS_INFO = {
  name: SITE_NAME,
  // Legal identity comes from the legal pages' single source of truth.
  legalName: LEGAL_ENTITY.legalName,
  vatID: confirmed(LEGAL_ENTITY.vat),
  registration: confirmed(LEGAL_ENTITY.registration),
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
    addressCountry: LEGAL_ENTITY.country,
    streetAddress: confirmed(LEGAL_ENTITY.address),
  },
  priceRange: "€€",
  // Checkout is priced and charged in EUR only.
  currenciesAccepted: "EUR",
  paymentAccepted: "Credit Card, PayPal, iDEAL",
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
