export function mapToSidebarStep(step: string): string {
  const map: Record<string, string> = {
    upload: "upload",
    form: "upload",
    synthesis: "synthesis",
    generating: "synthesis",
    review: "review",
    results: "review",
    fabric: "fabric",
    customizing: "fabric",
    creating: "fabric",
    sizing: "sizing",
    created: "sizing",
  };
  return map[step] ?? step;
}