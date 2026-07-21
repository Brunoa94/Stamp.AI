/**
 * JSON-LD structured data builders.
 *
 * These emit schema.org data that search engines use for rich results — a
 * genuine trust/credibility signal because it is first-party and matches
 * what the page actually shows. We only model things we can state honestly:
 * the organization, and the real FAQ. We intentionally do NOT emit
 * `AggregateRating`/`Review` data, which would require real, verified reviews.
 */

/** Public site origin. Set NEXT_PUBLIC_SITE_URL in production. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://stamp.ai";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Stamp AI",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description:
      "Turn a prompt or your own art into print-ready designs on custom clothes, printed on demand.",
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqPageSchema(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}
