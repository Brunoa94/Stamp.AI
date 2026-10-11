import { describe, expect, it } from "vitest";
import { organizationSchema } from "../organization";
import { LEGAL_ENTITY } from "@/features/legal/lib/constants/legalEntity";

describe("organizationSchema", () => {
  it("names the same legal entity as the legal pages", () => {
    const schema = organizationSchema();
    expect(schema.legalName).toBe(LEGAL_ENTITY.legalName);
    expect(schema.address.addressCountry).toBe(LEGAL_ENTITY.country);
    expect(schema.email).toBe(LEGAL_ENTITY.supportEmail);
    expect(schema.currenciesAccepted).toBe("EUR");
  });

  it("leaves placeholders pending legal review out of the JSON-LD", () => {
    const json = JSON.stringify(organizationSchema());
    expect(json).not.toContain("pending legal review");
    expect(json).not.toContain("Inc.");
  });
});
