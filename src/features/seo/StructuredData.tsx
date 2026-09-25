interface PropsI {
  data: Record<string, unknown>;
}

/**
 * JSON inside a <script> element is not HTML-escaped by the browser, so a
 * string value containing "</script>" would terminate the element and inject
 * markup. Escaping "<", ">" and "&" as JSON unicode escapes keeps the payload
 * valid JSON-LD while making break-out impossible.
 */
function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function StructuredData({ data }: PropsI) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
