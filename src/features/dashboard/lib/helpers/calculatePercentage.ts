export function calculatePercentage(current: number, total: number): number {
  if (!total) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}
