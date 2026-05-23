import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrintifyService } from "./printifyService";
import { createClient } from "@/lib/supabase/client";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

/**
 * ========================================================================
 * PrintifyService Edge Case Tests
 * ========================================================================
 * CRITICAL: Printify order creation failures mean payment succeeded but
 * product never gets manufactured. These are high-impact customer service issues.
 */

describe("PrintifyService Edge Cases", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getSession: vi.fn(),
      },
      functions: {
        invoke: vi.fn(),
      },
    };

    vi.mocked(createClient).mockReturnValue(mockSupabase as any);
  });

  /**
   * ========================================================================
   * EDGE CASE: Line Item Validation Failures
   * ========================================================================
   */

  describe("Line Item Validation", () => {
    /**
     * PROBLEM: Line item missing required variant_id for product_id configuration
     * Printify API rejects order with missing variant
     *
     * EXPECTED SOLUTION: validatePrintifyLineItem should catch this before API call
     *
     * IMPACT: Order creation fails after payment, manual intervention required
     */
    it("should validate line items have variant_id when using product_id", async () => {
      const invalidLineItems = [
        {
          product_id: "prod_123",
          // variant_id is missing!
          quantity: 2,
        },
      ];

      const orderPayload = {
        line_items: invalidLineItems,
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "90001",
        },
      };

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      // Should fail validation
      await expect(
        PrintifyService.createPrintifyOrder(orderPayload as any)
      ).rejects.toThrow();
    });

    /**
     * PROBLEM: Line item has both product_id and blueprint_id (invalid configuration)
     * Printify API requires EITHER product_id OR blueprint_id, not both
     *
     * EXPECTED SOLUTION: validatePrintifyLineItem should enforce mutual exclusivity
     *
     * IMPACT: Printify API rejects order, creates error loop
     */
    it("should reject line items with both product_id and blueprint_id", async () => {
      const conflictingLineItems = [
        {
          product_id: "prod_123", // Using existing product
          blueprint_id: 456, // AND trying to create on-the-fly (INVALID!)
          variant_id: 789,
          quantity: 1,
        },
      ];

      const orderPayload = {
        line_items: conflictingLineItems,
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "90001",
        },
      };

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      await expect(
        PrintifyService.createPrintifyOrder(orderPayload as any)
      ).rejects.toThrow();
    });

    /**
     * PROBLEM: Line item using blueprint_id without print_provider_id
     * On-the-fly creation requires BOTH blueprint_id and print_provider_id
     *
     * EXPECTED SOLUTION: Validate both fields present for on-the-fly creation
     *
     * IMPACT: Printify API returns unclear error
     */
    it("should require print_provider_id when using blueprint_id", async () => {
      const incompleteLineItems = [
        {
          blueprint_id: 456,
          // print_provider_id is missing!
          variant_id: 789,
          print_areas: { front: [] },
          quantity: 1,
        },
      ];

      const orderPayload = {
        line_items: incompleteLineItems,
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "90001",
        },
      };

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      await expect(
        PrintifyService.createPrintifyOrder(orderPayload as any)
      ).rejects.toThrow();
    });

    /**
     * PROBLEM: Quantity is 0 or negative
     * Invalid business logic, should be caught before API call
     *
     * EXPECTED SOLUTION: Validate quantity > 0
     *
     * IMPACT: Printify API error, or worse - $0 order accepted
     */
    it("should reject line items with zero or negative quantity", async () => {
      const invalidQuantityLineItems = [
        {
          product_id: "prod_123",
          variant_id: 456,
          quantity: 0, // Invalid!
        },
      ];

      const orderPayload = {
        line_items: invalidQuantityLineItems,
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "90001",
        },
      };

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      await expect(
        PrintifyService.createPrintifyOrder(orderPayload as any)
      ).rejects.toThrow();
    });
  });

  /**
   * ========================================================================
   * EDGE CASE: Image URL Issues
   * ========================================================================
   */

  describe("Image URL Failures", () => {
    /**
     * PROBLEM: custom_image_url returns 404 when Printify tries to fetch it
     * Order accepted but fails during production
     *
     * EXPECTED SOLUTION: Pre-validate image URL is accessible
     * Or use Printify's image upload API instead of direct URLs
     *
     * IMPACT: Order fails in production, customer charged but no product
     */
    it("should handle inaccessible custom_image_url", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: "Failed to fetch image from URL: 404 Not Found",
          code: "image_fetch_failed",
        },
      });

      const orderPayload = {
        line_items: [
          {
            product_id: "prod_123",
            variant_id: 456,
            quantity: 1,
          },
        ],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "90001",
        },
      };

      await expect(
        PrintifyService.createPrintifyOrder(orderPayload)
      ).rejects.toThrow();
    });

    /**
     * PROBLEM: Image URL uses HTTP instead of HTTPS
     * Printify requires HTTPS for security
     *
     * EXPECTED SOLUTION: Validate and upgrade HTTP to HTTPS automatically
     *
     * IMPACT: Order rejected by Printify
     */
    it("should handle HTTP (non-HTTPS) image URLs", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: "Image URL must use HTTPS protocol",
          code: "insecure_image_url",
        },
      });

      const orderPayload = {
        line_items: [
          {
            product_id: "prod_123",
            variant_id: 456,
            quantity: 1,
          },
        ],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "90001",
        },
      };

      await expect(
        PrintifyService.createPrintifyOrder(orderPayload)
      ).rejects.toThrow();
    });

    /**
     * PROBLEM: Image file size exceeds Printify's limits (typically 100MB)
     *
     * EXPECTED SOLUTION: Validate image size before upload
     *
     * IMPACT: Order rejected or processed with low-quality image
     */
    it("should handle oversized image files", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: "Image file size exceeds maximum allowed (100MB)",
          code: "image_too_large",
        },
      });

      const orderPayload = {
        line_items: [
          {
            product_id: "prod_123",
            variant_id: 456,
            quantity: 1,
          },
        ],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "90001",
        },
      };

      await expect(
        PrintifyService.createPrintifyOrder(orderPayload)
      ).rejects.toThrow();
    });
  });

  /**
   * ========================================================================
   * EDGE CASE: Shipping Address Validation
   * ========================================================================
   */

  describe("Shipping Address Issues", () => {
    /**
     * PROBLEM: Shipping address format invalid for specific country
     * (e.g., wrong postal code format for country)
     *
     * EXPECTED SOLUTION: Validate address format per country before submission
     *
     * IMPACT: Order rejected by Printify, needs address correction
     */
    it("should handle invalid postal code format for country", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: "Invalid ZIP code format for US addresses",
          code: "invalid_address",
        },
      });

      const orderPayload = {
        line_items: [
          {
            product_id: "prod_123",
            variant_id: 456,
            quantity: 1,
          },
        ],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "INVALID", // Wrong format for US
        },
      };

      await expect(
        PrintifyService.createPrintifyOrder(orderPayload as any)
      ).rejects.toThrow();
    });

    /**
     * PROBLEM: Printify doesn't ship to specific country
     *
     * EXPECTED SOLUTION: Validate country against Printify's shipping whitelist
     *
     * IMPACT: Order accepted but fails fulfillment
     */
    it("should handle unsupported shipping country", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: "Shipping to country XY is not supported",
          code: "unsupported_country",
        },
      });

      const orderPayload = {
        line_items: [
          {
            product_id: "prod_123",
            variant_id: 456,
            quantity: 1,
          },
        ],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "XY", // Unsupported country
          region: "",
          address1: "123 Main St",
          city: "City",
          zip: "12345",
        },
      };

      await expect(
        PrintifyService.createPrintifyOrder(orderPayload as any)
      ).rejects.toThrow();
    });
  });

  /**
   * ========================================================================
   * EDGE CASE: API & Network Failures
   * ========================================================================
   */

  describe("Printify API Failures", () => {
    /**
     * PROBLEM: Printify API returns 5xx error (service down)
     *
     * EXPECTED SOLUTION: Retry with exponential backoff
     * Create alert for manual order processing if retries fail
     *
     * IMPACT: Order payment succeeded but not sent to production
     */
    it("should handle Printify API unavailable (5xx)", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: "Printify API returned 503 Service Unavailable",
          statusCode: 503,
        },
      });

      const orderPayload = {
        line_items: [
          {
            product_id: "prod_123",
            variant_id: 456,
            quantity: 1,
          },
        ],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "90001",
        },
      };

      await expect(
        PrintifyService.createPrintifyOrder(orderPayload as any)
      ).rejects.toThrow();
    });

    /**
     * PROBLEM: Printify API rate limit exceeded
     * Too many order submissions in short time
     *
     * EXPECTED SOLUTION: Implement rate limiting on our side
     * Queue orders and retry with backoff
     *
     * IMPACT: Orders fail during high traffic periods
     */
    it("should handle Printify rate limiting", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: "Rate limit exceeded. Try again in 60 seconds.",
          code: "rate_limit_exceeded",
          statusCode: 429,
        },
      });

      const orderPayload = {
        line_items: [
          {
            product_id: "prod_123",
            variant_id: 456,
            quantity: 1,
          },
        ],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "90001",
        },
      };

      await expect(
        PrintifyService.createPrintifyOrder(orderPayload as any)
      ).rejects.toThrow();
    });

    /**
     * PROBLEM: Invalid Printify API credentials
     * (e.g., API key rotated but not updated in environment)
     *
     * EXPECTED SOLUTION: Monitor for 401 errors, alert immediately
     *
     * IMPACT: ALL orders fail until credentials fixed
     */
    it("should handle invalid Printify API credentials", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: {
          message: "Invalid API credentials",
          code: "unauthorized",
          statusCode: 401,
        },
      });

      const orderPayload = {
        line_items: [
          {
            product_id: "prod_123",
            variant_id: 456,
            quantity: 1,
          },
        ],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "90001",
        },
      };

      await expect(
        PrintifyService.createPrintifyOrder(orderPayload as any)
      ).rejects.toThrow();
    });
  });

  /**
   * ========================================================================
   * EDGE CASE: Test Mode vs Production Mode
   * ========================================================================
   */

  describe("Test Mode Handling", () => {
    /**
     * PROBLEM: Production order sent with is_test: true
     * Real customer charged but test order created
     *
     * EXPECTED SOLUTION: Validate test mode matches environment
     *
     * IMPACT: Customer pays but product never ships
     */
    it("should prevent test orders in production environment", async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "token" } },
        error: null,
      });

      const testOrderInProduction = {
        line_items: [
          {
            product_id: "prod_123",
            variant_id: 456,
            quantity: 1,
          },
        ],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "90001",
        },
        is_test: true, // BUG: Test mode in production!
      };

      // Should throw error
      await expect(
        PrintifyService.createPrintifyOrder(testOrderInProduction as any)
      ).rejects.toThrow(/test.*production/i);

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  /**
   * ========================================================================
   * EDGE CASE: Authentication & Session Issues
   * ========================================================================
   */

  describe("Authentication Failures", () => {
    /**
     * PROBLEM: User session expired during order submission
     * createPrintifyOrder requires valid session
     *
     * EXPECTED SOLUTION: Refresh session or redirect to login
     *
     * IMPACT: Order creation fails, user sees auth error
     */
    it("should handle expired user session", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null }, // Session expired!
        error: new Error("Session expired"),
      });

      const orderPayload = {
        line_items: [
          {
            product_id: "prod_123",
            variant_id: 456,
            quantity: 1,
          },
        ],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          country: "US",
          region: "CA",
          address1: "123 Main St",
          city: "Los Angeles",
          zip: "90001",
        },
      };

      await expect(
        PrintifyService.createPrintifyOrder(orderPayload as any)
      ).rejects.toThrow(/logged in/i);
    });
  });
});
