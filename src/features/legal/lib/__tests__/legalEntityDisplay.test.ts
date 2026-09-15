import { describe, expect, it } from "vitest";
import { LEGAL_ENTITY } from "../constants/legalEntity";
import {
  LEGAL_ENTITY_DISPLAY,
  PENDING_LEGAL_PLACEHOLDERS,
  toLegalEntityDisplay,
} from "../helpers/legalEntityDisplay";

describe("toLegalEntityDisplay", () => {
  it("renders null fields as visible placeholders", () => {
    const display = toLegalEntityDisplay({
      ...LEGAL_ENTITY,
      address: null,
      registration: null,
      vat: null,
    });

    expect(display.address).toBe(PENDING_LEGAL_PLACEHOLDERS.address);
    expect(display.registration).toBe(PENDING_LEGAL_PLACEHOLDERS.registration);
    expect(display.vat).toBe(PENDING_LEGAL_PLACEHOLDERS.vat);
  });

  it("passes provided values through untouched", () => {
    const display = toLegalEntityDisplay({
      ...LEGAL_ENTITY,
      address: "Example street 1, 1234 AB Amsterdam",
      registration: "12345678",
      vat: "NL123456789B01",
    });

    expect(display.address).toBe("Example street 1, 1234 AB Amsterdam");
    expect(display.registration).toBe("12345678");
    expect(display.vat).toBe("NL123456789B01");
  });

  it("produces only strings so ICU interpolation never receives null", () => {
    for (const value of Object.values(LEGAL_ENTITY_DISPLAY)) {
      expect(typeof value).toBe("string");
    }
  });
});
