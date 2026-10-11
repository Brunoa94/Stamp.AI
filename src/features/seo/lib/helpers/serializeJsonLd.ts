/**
 * JSON for an inline `<script type="application/ld+json">`.
 *
 * JSON.stringify leaves `<`, `>` and `&` as-is, so a value containing
 * `</script>` (a product name, for instance) would close the tag and inject
 * markup. Escaping them as unicode keeps the JSON identical for parsers.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
