/**
 * Legal entity details — the single source of truth for who operates the
 * shop. Consumed by the legal documents (via legalEntityDisplay) and by the
 * SEO Organization JSON-LD (src/features/seo/config/business.ts).
 *
 * TODO(legal): the `null` fields are deliberate placeholders. Before launch,
 * legal review must:
 *   1. Confirm the legal entity name and fill in the registered address,
 *      KvK registration number and VAT number.
 *   2. Create the privacy@ and security@ mailboxes, or keep routing both
 *      through support@ and update the addresses here.
 * Never fill these with guessed values: `null` is rendered as a visible
 * placeholder on the legal pages and omitted from structured data.
 */
export type LegalEntityType = {
  legalName: string;
  /** ISO 3166-1 alpha-2 country of incorporation. */
  countryCode: "NL";
  jurisdiction: string;
  courts: string;
  supportEmail: string;
  privacyEmail: string;
  securityEmail: string;
  /** Registered address; `null` until legal review provides it. */
  address: string | null;
  /** KvK (Dutch chamber of commerce) number; `null` until provided. */
  registration: string | null;
  /** EU VAT identification number; `null` until provided. */
  vat: string | null;
};

export const LEGAL_ENTITY: LegalEntityType = {
  legalName: "Stamp AI B.V.",
  countryCode: "NL",
  jurisdiction: "Dutch",
  courts: "the competent courts of the Netherlands",
  supportEmail: "support@stamp.ai",
  privacyEmail: "support@stamp.ai",
  securityEmail: "support@stamp.ai",
  address: null,
  registration: null,
  vat: null,
};
