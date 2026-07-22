import { SITE_URL, SITE_NAME } from "../config/site";
import { BUSINESS_INFO } from "../config/business";
import { organizationSchema } from "./organization";
import { webSiteSchema } from "./website";
import { webPageSchema } from "./webpage";
import { serviceSchema } from "./service";
import { faqPageSchema } from "./faq";
import type { FaqEntry } from "./types";

export function homepageSchema(faqEntries?: FaqEntry[]) {
  const schemas: Record<string, unknown>[] = [
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
