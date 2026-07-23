import { SITE_URL } from "../config/site";
import type { WebPageData } from "./types";

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
