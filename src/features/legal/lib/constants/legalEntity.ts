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
 *   3. Reconcile with src/features/seo/config/business.ts, which currently
 *      declares "Stamp AI Design Inc." / addressCountry "US" and feeds the
 *      Organization JSON-LD in the root layout. The legal pages assume an
 *      EU/Netherlands entity; the two must not contradict each other.
 */
export const LEGAL_ENTITY = {
  legalName: "Stamp AI B.V.",
  address: "[registered address — pending legal review]",
  registration: "[KvK number — pending legal review]",
  vat: "[VAT number — pending legal review]",
  jurisdiction: "Dutch",
  courts: "the competent courts of the Netherlands",
  supportEmail: "support@stamp.ai",
  privacyEmail: "support@stamp.ai",
  securityEmail: "support@stamp.ai",
} as const;
