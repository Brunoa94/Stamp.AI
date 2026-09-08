/**
 * Registry of the legal/policy pages rendered through LegalDocument.
 *
 * Section order and content live in src/i18n/messages/en.json under
 * `legal.<pageKey>.sections` — the catalog is the single source of truth,
 * so adding a section there is enough to render it.
 */

export const LEGAL_PAGE_KEYS = [
  "terms",
  "privacy",
  "cookies",
  "security",
  "shipping",
  "returns",
] as const;

export type LegalPageKeyType = (typeof LEGAL_PAGE_KEYS)[number];

/** Shown on every legal page; bump when any document's content changes. */
export const LEGAL_LAST_UPDATED = "August 13, 2026";
