/**
 * Legal feature types.
 *
 * A legal document is a flat, ordered list of sections resolved from the
 * `legal.<pageKey>.sections` message catalog. Each section has a heading,
 * one or more body paragraphs, and an optional bullet list.
 */

export type LegalSectionType = {
  id: string;
  heading: string;
  body: string[];
  bullets?: string[];
};

/** Raw shape of one section as authored in en.json, before ICU formatting. */
export type LegalSectionMessagesType = {
  heading: string;
  body: string[];
  bullets?: string[];
};
