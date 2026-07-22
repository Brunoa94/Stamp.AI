import { webPageSchema } from "./webpage";
import { breadcrumbSchema } from "./breadcrumb";
import type { WebPageData, BreadcrumbItem } from "./types";

export function pageSchema(
  pageData: WebPageData,
  breadcrumbs: BreadcrumbItem[]
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
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
