interface PropsI {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: PropsI) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
