import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getPayPalApiBase,
  getPayPalAccessToken,
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrder,
  PayPalCaptureError,
} from "./paypal-server";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("PayPal Server Utilities", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      PAYPAL_CLIENT_ID: "test-client-id",
      PAYPAL_CLIENT_SECRET: "test-client-secret",
      PAYPAL_MODE: "sandbox",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getPayPalApiBase", () => {
    it("returns sandbox URL when PAYPAL_MODE is sandbox", () => {
      process.env.PAYPAL_MODE = "sandbox";
      expect(getPayPalApiBase()).toBe("https://api-m.sandbox.paypal.com");
    });

    it("returns live URL when PAYPAL_MODE is live", () => {
      process.env.PAYPAL_MODE = "live";
      expect(getPayPalApiBase()).toBe("https://api-m.paypal.com");
    });

    it("defaults to sandbox when PAYPAL_MODE is not set", () => {
      delete process.env.PAYPAL_MODE;
      expect(getPayPalApiBase()).toBe("https://api-m.sandbox.paypal.com");
    });
  });

  describe("getPayPalAccessToken", () => {
    it("successfully retrieves access token", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: "test-access-token" }),
      });

      const token = await getPayPalAccessToken();

      expect(token).toBe("test-access-token");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api-m.sandbox.paypal.com/v1/oauth2/token",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/x-www-form-urlencoded",
          }),
          body: "grant_type=client_credentials",
        })
      );
    });

    it("throws error when token request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
        text: () => Promise.resolve("Invalid credentials"),
      });

      await expect(getPayPalAccessToken()).rejects.toThrow(
        "Failed to get PayPal access token"
      );
    });

    it("throws error when PAYPAL_CLIENT_ID is not set", async () => {
      delete process.env.PAYPAL_CLIENT_ID;

      await expect(getPayPalAccessToken()).rejects.toThrow(
        "PAYPAL_CLIENT_ID environment variable is not set"
      );
    });

    it("throws error when PAYPAL_CLIENT_SECRET is not set", async () => {
      delete process.env.PAYPAL_CLIENT_SECRET;

      await expect(getPayPalAccessToken()).rejects.toThrow(
        "PAYPAL_CLIENT_SECRET environment variable is not set"
      );
    });
  });

  describe("createPayPalOrder", () => {
    beforeEach(() => {
      // Mock token fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: "test-token" }),
      });
    });

    it("creates order successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "ORDER-123",
            status: "CREATED",
            links: [
              { rel: "approve", href: "https://paypal.com/approve?token=ORDER-123" },
            ],
          }),
      });

      const result = await createPayPalOrder({
        amount: 99.99,
        returnUrl: "https://example.com/return",
        cancelUrl: "https://example.com/cancel",
      });

      expect(result.id).toBe("ORDER-123");
      expect(result.status).toBe("CREATED");
      expect(result.links).toHaveLength(1);
    });

    it("includes shipping address when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "ORDER-123",
            status: "CREATED",
            links: [],
          }),
      });

      await createPayPalOrder({
        amount: 99.99,
        returnUrl: "https://example.com/return",
        cancelUrl: "https://example.com/cancel",
        shippingAddress: {
          firstName: "John",
          lastName: "Doe",
          address1: "123 Main St",
          city: "Los Angeles",
          region: "CA",
          zip: "90001",
          country: "US",
        },
      });

      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
      const body = JSON.parse(lastCall[1].body);

      expect(body.purchase_units[0].shipping).toBeDefined();
      expect(body.purchase_units[0].shipping.name.full_name).toBe("John Doe");
      expect(body.application_context.shipping_preference).toBe("SET_PROVIDED_ADDRESS");
    });

    it("throws error when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Invalid request" }),
      });

      await expect(
        createPayPalOrder({
          amount: 99.99,
          returnUrl: "https://example.com/return",
          cancelUrl: "https://example.com/cancel",
        })
      ).rejects.toThrow("PayPal API error");
    });
  });

  describe("capturePayPalOrder", () => {
    beforeEach(() => {
      // Mock token fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: "test-token" }),
      });
    });

    it("captures order successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "ORDER-123",
            status: "COMPLETED",
            payer: {
              payer_id: "PAYER-123",
              email_address: "buyer@example.com",
            },
            purchase_units: [
              {
                payments: {
                  captures: [
                    {
                      id: "CAPTURE-123",
                      status: "COMPLETED",
                      amount: { currency_code: "USD", value: "99.99" },
                    },
                  ],
                },
              },
            ],
          }),
      });

      const result = await capturePayPalOrder("ORDER-123");

      expect(result.id).toBe("ORDER-123");
      expect(result.status).toBe("COMPLETED");
      expect(result.payer?.email_address).toBe("buyer@example.com");
    });

    it("throws PayPalCaptureError when payment is declined", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            name: "UNPROCESSABLE_ENTITY",
            details: [{ issue: "INSTRUMENT_DECLINED" }],
            debug_id: "debug-123",
            message: "The payment method was declined",
          }),
      });

      await expect(capturePayPalOrder("ORDER-123")).rejects.toThrow(PayPalCaptureError);

      try {
        await capturePayPalOrder("ORDER-123");
      } catch (error) {
        if (error instanceof PayPalCaptureError) {
          expect(error.code).toBe("INSTRUMENT_DECLINED");
          expect(error.isRetryable).toBe(true);
        }
      }
    });

    it("throws PayPalCaptureError when status is not COMPLETED", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "ORDER-123",
            status: "PENDING",
            purchase_units: [],
          }),
      });

      await expect(capturePayPalOrder("ORDER-123")).rejects.toThrow(PayPalCaptureError);
    });
  });

  describe("getPayPalOrder", () => {
    beforeEach(() => {
      // Mock token fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: "test-token" }),
      });
    });

    it("retrieves order details successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "ORDER-123",
            status: "APPROVED",
            links: [],
          }),
      });

      const result = await getPayPalOrder("ORDER-123");

      expect(result.id).toBe("ORDER-123");
      expect(result.status).toBe("APPROVED");
    });
  });

  describe("PayPalCaptureError", () => {
    it("creates error with correct properties", () => {
      const error = new PayPalCaptureError(
        "Payment declined",
        "INSTRUMENT_DECLINED",
        "debug-123",
        true
      );

      expect(error.message).toBe("Payment declined");
      expect(error.code).toBe("INSTRUMENT_DECLINED");
      expect(error.debugId).toBe("debug-123");
      expect(error.isRetryable).toBe(true);
      expect(error.name).toBe("PayPalCaptureError");
    });

    it("defaults isRetryable to false", () => {
      const error = new PayPalCaptureError("Error", "CODE");
      expect(error.isRetryable).toBe(false);
    });
  });
});
