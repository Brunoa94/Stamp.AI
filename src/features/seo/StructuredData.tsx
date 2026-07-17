/**
 * StructuredData
 *
 * Renders a JSON-LD <script> for the given schema.org object. The payload is
 * first-party data we build ourselves (see jsonLd.ts), so the serialized JSON
 * is safe to inline.
 */

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
