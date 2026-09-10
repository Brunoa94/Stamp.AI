/**
 * Tests for the shared product SEO helper used by the sync-blueprint
 * edge function. Imported across the repo boundary the same way as
 * resolvePrintAreas.test.ts so it runs under vitest.
 */

import { describe, it, expect } from "vitest";
import { buildProductSeoRow } from "../../../supabase/functions/_shared/productSeo";

const NOW = "2026-08-13T12:00:00.000Z";

describe("buildProductSeoRow", () => {
  it("builds an upsert row with the trimmed description", () => {
    const row = buildProductSeoRow(145, "  Soft unisex tee  ", NOW);

    expect(row).toEqual({
      blueprint_id: 145,
      printify_description: "Soft unisex tee",
      updated_at: NOW,
    });
  });

  it("keeps HTML markup untouched (raw source data)", () => {
    const row = buildProductSeoRow(553, "<p>Heavyweight tote</p>", NOW);

    expect(row.printify_description).toBe("<p>Heavyweight tote</p>");
  });

  it("stores null when the description is undefined", () => {
    expect(buildProductSeoRow(145, undefined, NOW).printify_description).toBeNull();
  });

  it("stores null when the description is null", () => {
    expect(buildProductSeoRow(145, null, NOW).printify_description).toBeNull();
  });

  it("stores null when the description is empty or whitespace-only", () => {
    expect(buildProductSeoRow(145, "", NOW).printify_description).toBeNull();
    expect(buildProductSeoRow(145, "   \n\t ", NOW).printify_description).toBeNull();
  });

  it("stores null when the description is not a string", () => {
    expect(
      buildProductSeoRow(145, 42 as unknown as string, NOW).printify_description
    ).toBeNull();
  });
});
