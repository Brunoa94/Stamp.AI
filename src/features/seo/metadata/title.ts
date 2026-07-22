import { SITE_NAME } from "../config/site";

export function generateTitle(pageTitle: string): string {
  const fullTitle = `${pageTitle} | ${SITE_NAME}`;
  if (fullTitle.length > 60) {
    return `${pageTitle.substring(0, 50)}... | ${SITE_NAME}`;
  }
  return fullTitle;
}

export const titleTemplate = {
  template: `%s | ${SITE_NAME}`,
  default: `${SITE_NAME} - Custom AI-Designed Clothes & Prints`,
};
