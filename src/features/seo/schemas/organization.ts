import { SITE_URL } from "../config/site";
import { SOCIAL_PROFILES } from "../config/social";
import { BUSINESS_INFO } from "../config/business";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    // Omitted (undefined is dropped by JSON.stringify) until legal review fills them.
    vatID: BUSINESS_INFO.vatID,
    ...(BUSINESS_INFO.registration
      ? { identifier: { "@type": "PropertyValue", propertyID: "KvK", value: BUSINESS_INFO.registration } }
      : {}),
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
