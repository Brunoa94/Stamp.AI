export function optimizeDescription(description: string): string {
  if (description.length <= 160) return description;
  return description.substring(0, 157) + "...";
}
