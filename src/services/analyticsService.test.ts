import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AnalyticsService } from "./analyticsService";

const TEST_MEASUREMENT_ID = "G-TEST123456";

describe("AnalyticsService", () => {
  beforeEach(() => {
    AnalyticsService.resetForTesting();
    delete window.gtag;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    delete window.gtag;
  });

  const enableProductionMode = () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", TEST_MEASUREMENT_ID);
  };

  describe("track", () => {
    it("should format events correctly and forward them to gtag", () => {
      enableProductionMode();
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      AnalyticsService.track("login", { method: "email" });

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith("event", "login", {
        method: "email",
      });
    });

    it("should send an empty params object when no params are provided", () => {
      enableProductionMode();
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      AnalyticsService.track("logout");

      expect(gtagMock).toHaveBeenCalledWith("event", "logout", {});
    });

    it("should not call gtag in development, logging to console instead", () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", TEST_MEASUREMENT_ID);
      const gtagMock = vi.fn();
      window.gtag = gtagMock;
      const consoleSpy = vi
        .spyOn(console, "info")
        .mockImplementation(() => undefined);

      AnalyticsService.track("add_to_cart", { value: 19.99 });

      expect(gtagMock).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("[analytics]", "add_to_cart", {
        value: 19.99,
      });
    });

    it("should not send events when no measurement id is configured", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      AnalyticsService.track("login", { method: "email" });

      expect(gtagMock).not.toHaveBeenCalled();
    });

    it("should queue events fired before gtag loads and flush them in order", () => {
      enableProductionMode();

      AnalyticsService.track("stamp_generate_start", { prompt_length: 12 });
      AnalyticsService.track("stamp_generate_complete", { prompt_length: 12 });

      const gtagMock = vi.fn();
      window.gtag = gtagMock;
      AnalyticsService.flush();

      expect(gtagMock).toHaveBeenCalledTimes(2);
      expect(gtagMock).toHaveBeenNthCalledWith(
        1,
        "event",
        "stamp_generate_start",
        { prompt_length: 12 },
      );
      expect(gtagMock).toHaveBeenNthCalledWith(
        2,
        "event",
        "stamp_generate_complete",
        { prompt_length: 12 },
      );
    });

    it("should not resend queued events after they are flushed", () => {
      enableProductionMode();

      AnalyticsService.track("view_cart");

      const gtagMock = vi.fn();
      window.gtag = gtagMock;
      AnalyticsService.flush();
      AnalyticsService.flush();

      expect(gtagMock).toHaveBeenCalledTimes(1);
    });

    it("should include required e-commerce params", () => {
      enableProductionMode();
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      AnalyticsService.track("purchase", {
        transaction_id: "pi_123",
        currency: "USD",
        value: 39.98,
        items: [
          {
            item_id: "product-1",
            item_name: "Custom Tee",
            price: 19.99,
            quantity: 2,
          },
        ],
      });

      expect(gtagMock).toHaveBeenCalledWith(
        "event",
        "purchase",
        expect.objectContaining({
          transaction_id: "pi_123",
          currency: "USD",
          value: 39.98,
          items: [
            expect.objectContaining({
              item_id: "product-1",
              item_name: "Custom Tee",
              price: 19.99,
              quantity: 2,
            }),
          ],
        }),
      );
    });
  });

  describe("pageView", () => {
    it("should track a page_view event with the given path", () => {
      enableProductionMode();
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      AnalyticsService.pageView("/stamp");

      expect(gtagMock).toHaveBeenCalledWith("event", "page_view", {
        page_path: "/stamp",
      });
    });
  });
});
