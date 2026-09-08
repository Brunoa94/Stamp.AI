/**
 * Percentage of `current` over `total`, clamped to 0-100.
 * Guards against divide-by-zero.
 */
export function calculatePercentage(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
}
