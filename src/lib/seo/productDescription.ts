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
 * Extract product specs from Printify HTML description.
 * Handles multiple formats:
 * 1. Bullet format: `<div>.:Spec text</div>` or `.:text`
 * 2. Paragraph format: Plain text separated by newlines or HTML tags
 * Returns an array of clean spec strings.
 */
export function extractProductSpecs(
  seo: Pick<ProductSeo, "printify_description"> | null | undefined
): string[] {
  if (!seo?.printify_description) {
    return [];
  }

  const html = seo.printify_description;
  const specs: string[] = [];

  // First, try matching Printify bullet format: <div>.:text</div> or just .:text
  const specPattern = /<div>\s*\.:\s*([^<]+)<\/div>|\.:\s*([^\n<]+)/g;
  let match;

  while ((match = specPattern.exec(html)) !== null) {
    const specText = (match[1] || match[2] || "").trim();
    if (specText && specText.length > 0 && specText.length < 250) {
      const decoded = specText.replace(
        /&(?:amp|lt|gt|quot|#39|apos|nbsp);/g,
        (entity) => HTML_ENTITIES[entity] ?? entity
      );
      specs.push(decoded);
    }
  }

  // If no bullet specs found, try paragraph format (sentences/lines as specs)
  if (specs.length === 0) {
    // Split by common paragraph delimiters: <br>, <p>, newlines, or sentence boundaries
    const plainText = stripHtml(html);

    // Split on sentence endings followed by capital letters (new sentences)
    // or split on common delimiters
    const sentences = plainText
      .split(/(?<=[.!])\s+(?=[A-Z])|[\n\r]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10 && s.length < 250);

    for (const sentence of sentences) {
      if (sentence) {
        specs.push(sentence);
      }
    }
  }

  return specs;
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
