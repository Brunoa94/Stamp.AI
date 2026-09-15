import { describe, expect, it } from "vitest";
import { organizationSchema } from "../organization";
import { LEGAL_ENTITY } from "@/features/legal/lib/constants/legalEntity";

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => collectStrings(v, out));
  }
  return out;
}

describe("organizationSchema", () => {
  const schema = organizationSchema() as Record<string, unknown>;

  it("derives legal identity from LEGAL_ENTITY", () => {
    expect(schema.legalName).toBe(LEGAL_ENTITY.legalName);
    expect(schema.address).toMatchObject({
      "@type": "PostalAddress",
      addressCountry: LEGAL_ENTITY.countryCode,
    });
    expect(schema.email).toBe(LEGAL_ENTITY.supportEmail);
  });

  it("never emits bracketed placeholder text", () => {
    for (const text of collectStrings(schema)) {
      expect(text).not.toContain("[");
      expect(text).not.toMatch(/pending legal review/i);
    }
  });

  it("omits fields that are still null instead of emitting null", () => {
    const json = JSON.stringify(schema);
    expect(json).not.toContain("null");
    if (LEGAL_ENTITY.vat === null) expect(schema).not.toHaveProperty("vatID");
    if (LEGAL_ENTITY.registration === null) {
      expect(schema).not.toHaveProperty("taxID");
    }
    if (LEGAL_ENTITY.address === null) {
      expect(schema.address).not.toHaveProperty("streetAddress");
    }
  });
});
