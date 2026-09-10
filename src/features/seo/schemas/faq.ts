import { SITE_URL } from "../config/site";
import type { FaqEntry } from "./types";

export function faqPageSchema(
  entries: FaqEntry[],
  id: string = `${SITE_URL}/#faq`
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": id,
    mainEntity: entries.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}
