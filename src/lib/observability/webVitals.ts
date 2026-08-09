/**
 * Web Vitals Performance Monitoring
 *
 * Captures Core Web Vitals metrics and sends them to Sentry
 * for performance monitoring and analysis.
 *
 * Metrics tracked:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Perceived loading speed
 * - TTFB (Time to First Byte) - Server response time
 * - INP (Interaction to Next Paint) - Overall responsiveness
 */

import * as Sentry from "@sentry/nextjs";

type MetricName = "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";

interface WebVitalsMetric {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Thresholds for Web Vitals ratings
 * Based on Google's Core Web Vitals thresholds
 */
const THRESHOLDS: Record<MetricName, { good: number; poor: number }> = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

/**
 * Get rating for a metric value
 */
function getRating(
  name: MetricName,
  value: number
): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Report a Web Vital metric to Sentry
 */
export function reportWebVital(metric: WebVitalsMetric): void {
  const { name, value, rating, id } = metric;

  // Add as a Sentry measurement
  Sentry.addBreadcrumb({
    category: "web-vital",
    message: `${name}: ${value.toFixed(2)} (${rating})`,
    level: rating === "poor" ? "warning" : "info",
    data: {
      metric: name,
      value,
      rating,
      id,
      threshold_good: THRESHOLDS[name].good,
      threshold_poor: THRESHOLDS[name].poor,
    },
  });

  // Report poor metrics as custom events for alerting
  if (rating === "poor") {
    Sentry.captureMessage(`Poor Web Vital: ${name}`, {
      level: "warning",
      tags: {
        metric_name: name,
        metric_rating: rating,
      },
      extra: {
        value,
        threshold_good: THRESHOLDS[name].good,
        threshold_poor: THRESHOLDS[name].poor,
      },
    });
  }
}

/**
 * Next.js Web Vitals handler
 *
 * Use this with Next.js's built-in reportWebVitals function.
 *
 * @example
 * ```tsx
 * // In _app.tsx (Pages Router) or via useReportWebVitals (App Router)
 * export function reportWebVitals(metric: NextWebVitalsMetric) {
 *   handleNextWebVital(metric);
 * }
 * ```
 */
export function handleNextWebVital(metric: {
  id: string;
  name: string;
  value: number;
  startTime: number;
  label: "web-vital" | "custom";
}): void {
  // Only process web vitals, not custom metrics
  if (metric.label !== "web-vital") return;

  const name = metric.name as MetricName;
  if (!(name in THRESHOLDS)) return;

  reportWebVital({
    name,
    value: metric.value,
    rating: getRating(name, metric.value),
    delta: metric.value, // Next.js doesn't provide delta
    id: metric.id,
    navigationType: "navigate",
  });
}
