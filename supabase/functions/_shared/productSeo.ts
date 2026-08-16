/**
 * Product SEO helpers shared by the sync-blueprint edge function.
 * Kept free of Deno-specific imports so vitest can exercise it from
 * src/tests/edge-functions (same pattern as resolvePrintAreas).
 */

export interface ProductSeoUpsertRow {
  blueprint_id: number;
  printify_description: string | null;
  updated_at: string;
}

/**
 * Build the product_seo upsert row for a synced blueprint.
 * Blank or whitespace-only descriptions are stored as NULL so that
 * consumers can rely on "null means no description".
 */
export function buildProductSeoRow(
  blueprintId: number,
  description: string | null | undefined,
  updatedAt: string,
): ProductSeoUpsertRow {
  const trimmed = typeof description === "string" ? description.trim() : "";

  return {
    blueprint_id: blueprintId,
    printify_description: trimmed.length > 0 ? trimmed : null,
    updated_at: updatedAt,
  };
}
