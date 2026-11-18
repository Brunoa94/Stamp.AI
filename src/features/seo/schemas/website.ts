import { SITE_URL, SITE_NAME, DEFAULT_LOCALE } from "../config/site";
import { BUSINESS_INFO } from "../config/business";

/** `inLanguage` is the BCP 47 tag of the language the site was rendered in */
export function webSiteSchema(inLanguage: string = DEFAULT_LOCALE) {
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
    inLanguage,
  };
}
