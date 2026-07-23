import { SITE_URL } from "../config/site";

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
