import type {
  AnalyticsEventNameT,
  AnalyticsEventParamsT,
  QueuedAnalyticsEventT,
} from "@/features/analytics/types/analyticsTypes";

const MAX_QUEUE_SIZE = 50;

/**
 * Centralized GA4 analytics service.
 *
 * - In development, events are logged to the console instead of being sent.
 * - Events fired before gtag.js has loaded are queued and flushed once it is
 *   available (flush is attempted on every track call and by the GA script's
 *   onLoad callback).
 */
export class AnalyticsService {
  private static queue: QueuedAnalyticsEventT[] = [];

  static getMeasurementId(): string | undefined {
    return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  }

  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  private static isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  }

  private static isConfigured(): boolean {
    return Boolean(this.getMeasurementId());
  }

  /** Track a GA4 event. */
  static track(name: AnalyticsEventNameT, params?: AnalyticsEventParamsT): void {
    if (!this.isBrowser()) return;

    // Always log in development for debugging
    if (this.isDevelopment()) {
      console.info("[analytics]", name, params ?? {});
    }

    if (!this.isConfigured()) return;

    this.queue.push({ name, params });
    if (this.queue.length > MAX_QUEUE_SIZE) {
      this.queue.shift();
    }
    this.flush();
  }

  /** Track a page view (used by the route-change tracker). */
  static pageView(path: string): void {
    this.track("page_view", { page_path: path });
  }

  /** Send queued events if gtag.js is available. */
  static flush(): void {
    if (!this.isBrowser() || typeof window.gtag !== "function") return;

    const pending = this.queue;
    this.queue = [];
    for (const event of pending) {
      window.gtag("event", event.name, event.params ?? {});
    }
  }

  /** Test-only helper to reset internal state between test cases. */
  static resetForTesting(): void {
    this.queue = [];
  }
}
