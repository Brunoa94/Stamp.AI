/**
 * Legal entity details interpolated into the legal documents
 * (Terms of Service, Privacy Policy, Cookie Policy, Security).
 *
 * TODO(legal): Every bracketed value below is a deliberate, visible
 * placeholder. Before launch, legal review must:
 *   1. Confirm the legal entity name and replace the registered address,
 *      KvK registration number and VAT number.
 *   2. Create the privacy@ and security@ mailboxes, or keep routing both
 *      through support@ and update the addresses here.
 *
 * src/features/seo/config/business.ts derives the Organization JSON-LD from
 * these values, so search engines and the legal pages name the same entity.
 * Bracketed placeholders are left out of the JSON-LD until they are filled.
 */
export const LEGAL_ENTITY = {
  legalName: "Stamp AI B.V.",
  address: "[registered address — pending legal review]",
  registration: "[KvK number — pending legal review]",
  vat: "[VAT number — pending legal review]",
  /** ISO 3166-1 alpha-2 country of registration. */
  country: "NL",
  jurisdiction: "Dutch",
  courts: "the competent courts of the Netherlands",
  supportEmail: "support@stamp.ai",
  privacyEmail: "support@stamp.ai",
  securityEmail: "support@stamp.ai",
} as const;

/** True for a value still waiting on legal review (a "[...]" placeholder). */
export function isPendingLegalValue(value: string): boolean {
  return value.startsWith("[");
}
