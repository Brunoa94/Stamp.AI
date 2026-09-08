/**
 * Product Display Titles
 * Fallback display titles when database display_title is not set
 */

const BLUEPRINT_TITLE_MAP: Record<number, string> = {
  // Add custom display titles by blueprint_id if needed
};

/**
 * Get a display title for a product
 * Falls back to the original name if no custom title is defined
 */
export function getDisplayTitle(
  blueprintId: number,
  originalName: string
): string {
  return BLUEPRINT_TITLE_MAP[blueprintId] ?? originalName;
}
