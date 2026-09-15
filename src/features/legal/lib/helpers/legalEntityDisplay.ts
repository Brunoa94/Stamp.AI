import {
  LEGAL_ENTITY,
  type LegalEntityType,
} from "../constants/legalEntity";

type PendingFieldType = "address" | "registration" | "vat";

/** Visible placeholder text for fields legal review has not provided yet. */
export const PENDING_LEGAL_PLACEHOLDERS: Record<PendingFieldType, string> = {
  address: "[registered address — pending legal review]",
  registration: "[KvK number — pending legal review]",
  vat: "[VAT number — pending legal review]",
};

export type LegalEntityDisplayType = Record<keyof LegalEntityType, string>;

/**
 * Maps the typed entity (with `null` placeholders) to an all-string record
 * suitable for ICU message interpolation in the legal documents.
 */
export function toLegalEntityDisplay(
  entity: LegalEntityType,
): LegalEntityDisplayType {
  return {
    ...entity,
    address: entity.address ?? PENDING_LEGAL_PLACEHOLDERS.address,
    registration:
      entity.registration ?? PENDING_LEGAL_PLACEHOLDERS.registration,
    vat: entity.vat ?? PENDING_LEGAL_PLACEHOLDERS.vat,
  };
}

export const LEGAL_ENTITY_DISPLAY = toLegalEntityDisplay(LEGAL_ENTITY);
