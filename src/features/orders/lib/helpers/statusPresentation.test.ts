import { describe, expect, it } from "vitest";
import {
  getOrderDisplayStatus,
  getStatusBadgeClass,
  toDisplayStatus,
} from "./statusPresentation";

function makeOrder(
  status: string | null,
  printifyStatus: string | null = null
) {
  return { status, printify_status: printifyStatus };
}

describe("toDisplayStatus", () => {
  it.each([
    ["pending", "pending"],
    ["waiting_confirmation", "processing"],
    ["confirmed", "processing"],
    ["processing", "processing"],
    ["shipped", "shipped"],
    ["delivered", "delivered"],
    ["cancelled", "cancelled"],
    ["unsuccessful_confirmation", "cancelled"],
  ])("maps database status %s to %s", (dbStatus, expected) => {
    expect(toDisplayStatus(dbStatus)).toBe(expected);
  });

  it("falls back to processing for null and undefined", () => {
    expect(toDisplayStatus(null)).toBe("processing");
    expect(toDisplayStatus(undefined)).toBe("processing");
  });
});

describe("getOrderDisplayStatus", () => {
  describe("granular Printify stages", () => {
    it.each([
      ["pending", "preparing"],
      ["on-hold", "preparing"],
      ["payment-not-received", "preparing"],
      ["cost-calculation", "preparing"],
      ["sending-to-production", "inProduction"],
      ["sending_to_production_delegate", "inProduction"],
      ["sending_to_production_delegate_sync", "inProduction"],
      ["in-production", "inProduction"],
      ["fulfilled", "shipped"],
      ["partially-fulfilled", "shipped"],
      ["canceled", "cancelled"],
      ["has-issues", "hasIssues"],
      ["unfulfillable", "hasIssues"],
      ["source-check-failed", "hasIssues"],
    ])("maps printify_status %s to %s", (printifyStatus, expected) => {
      expect(getOrderDisplayStatus(makeOrder("processing", printifyStatus))).toBe(
        expected
      );
    });
  });

  describe("database terminal states win over printify_status", () => {
    it("shows delivered when the database says delivered", () => {
      expect(getOrderDisplayStatus(makeOrder("delivered", "fulfilled"))).toBe(
        "delivered"
      );
    });

    it("shows cancelled when the database says cancelled", () => {
      expect(getOrderDisplayStatus(makeOrder("cancelled", "in-production"))).toBe(
        "cancelled"
      );
    });

    it("shows cancelled for unsuccessful_confirmation", () => {
      expect(
        getOrderDisplayStatus(makeOrder("unsuccessful_confirmation", null))
      ).toBe("cancelled");
    });
  });

  describe("fallback without printify_status", () => {
    it.each([
      ["pending", "processing"],
      ["waiting_confirmation", "processing"],
      ["confirmed", "processing"],
      ["processing", "processing"],
      ["shipped", "shipped"],
      ["delivered", "delivered"],
      ["cancelled", "cancelled"],
    ])("collapses database status %s to %s", (dbStatus, expected) => {
      expect(getOrderDisplayStatus(makeOrder(dbStatus))).toBe(expected);
    });

    it("falls back to processing for null status", () => {
      expect(getOrderDisplayStatus(makeOrder(null))).toBe("processing");
    });

    it("falls back to processing for an unknown printify_status", () => {
      expect(
        getOrderDisplayStatus(makeOrder("processing", "some-new-status"))
      ).toBe("processing");
    });
  });
});

describe("getStatusBadgeClass", () => {
  it("uses success colors for delivered", () => {
    expect(getStatusBadgeClass("delivered")).toContain("stamp-success");
  });

  it("uses info colors for shipped", () => {
    expect(getStatusBadgeClass("shipped")).toContain("stamp-info");
  });

  it.each(["cancelled", "hasIssues"])("uses error colors for %s", (status) => {
    expect(getStatusBadgeClass(status)).toContain("stamp-error");
  });

  it.each(["processing", "preparing", "inProduction"])(
    "uses warning colors for %s",
    (status) => {
      expect(getStatusBadgeClass(status)).toContain("stamp-warning");
    }
  );
});
