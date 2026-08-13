/**
 * Product description resolution helpers.
 *
 * product_seo stores the raw Printify description, which may contain
 * HTML markup. UI copy and meta/structured data need plain text, and
 * admin-edited meta_description must win over the Printify source.
 */

import type { ProductSeo } from "@/types/catalog";

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/**
 * Strip HTML tags and decode common entities, collapsing whitespace.
 * Regex-based on purpose: runs on the server (no DOM) and Printify
 * descriptions are simple markup, not arbitrary documents.
 */
export function stripHtml(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, " ");
  const decoded = withoutTags.replace(
    /&(?:amp|lt|gt|quot|#39|apos|nbsp);/g,
    (entity) => HTML_ENTITIES[entity] ?? entity
  );

  return decoded.replace(/\s+/g, " ").trim();
}

/**
 * Resolve the display/meta description for a product:
 * meta_description override first, then the (plain-text) Printify
 * description, otherwise null.
 */
export function resolveProductDescription(
  seo: Pick<ProductSeo, "meta_description" | "printify_description"> | null | undefined
): string | null {
  if (!seo) {
    return null;
  }

  const metaDescription = seo.meta_description?.trim();
  if (metaDescription) {
    return metaDescription;
  }

  if (seo.printify_description) {
    const plainText = stripHtml(seo.printify_description);
    if (plainText) {
      return plainText;
    }
  }

  return null;
}
