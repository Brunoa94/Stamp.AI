import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderFulfillmentService } from "./orderFulfillmentService";
import type { FulfillmentInput } from "./orderFulfillmentService";

// Mock all service dependencies
vi.mock("./orderService");
vi.mock("./printifyService");
vi.mock("./cartService");
vi.mock("./refundService");

import { OrderService } from "./orderService";
import { PrintifyService } from "./printifyService";
import { CartService } from "./cartService";
import { RefundService } from "./refundService";

/**
 * ========================================================================
 * OrderFulfillmentService Edge Case Tests
 * ========================================================================
 * CRITICAL: This service orchestrates the complete post-payment flow.
 * Failures here can result in:
 * - Customer charged but no order created
 * - Order created but no Printify order
 * - Failed refunds leaving customer charged with no product
 *
 * These are the highest-impact failure scenarios in the entire system.
 */

describe("OrderFulfillmentService Edge Cases", () => {
  const mockUser = { id: "user_123", email: "test@example.com" };
  const mockCart = {
    id: "cart_123",
    user_id: "user_123",
    created_at: new Date().toISOString(),
    items: [],
    cart_items: [
      {
        id: "item_1",
        product_id: "prod_123",
        quantity: 2,
        unit_price: 50.00,
      },
    ],
  };
  const mockLineItems = [
    { product_id: "prod_123", variant_id: 456, quantity: 2 },
  ];
  const mockShippingAddress = {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    phone: "1234567890",
    country: "US",
    region: "CA",
    address1: "123 Main St",
    address2: "",
    city: "Los Angeles",
    zip: "90001",
  };
  const mockPayment = {
    provider: "stripe" as const,
    paymentId: "pi_test_123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * ========================================================================
   * EDGE CASE: Order Creation Retry Failures
   * ========================================================================
   */

  describe("Order Creation with Retries", () => {
    /**
     * PROBLEM: All 3 order creation attempts fail due to database issues
     * Payment succeeded but cannot create order record
     *
     * EXPECTED SOLUTION: Attempt automatic refund after all retries exhausted
     * Create refund_failures record if refund also fails
     *
     * IMPACT: Customer charged with no order. CRITICAL SCENARIO.
     */
    it("should attempt refund after all order creation retries fail", async () => {
      // Mock order creation to fail all 3 times
      vi.mocked(OrderService.createOrderFromCart).mockRejectedValue(
        new Error("Database connection lost")
      );

      // Mock successful refund
      vi.mocked(RefundService.processRefund).mockResolvedValue(undefined);

      const input: FulfillmentInput = {
        user: mockUser as any,
        cart: mockCart as any,
        lineItems: mockLineItems,
        shippingAddress: mockShippingAddress,
        payment: mockPayment,
        orderAmount: 100.00,
      };

      const result = await OrderFulfillmentService.fulfill(input);

      // Should fail overall
      expect(result.success).toBe(false);
      expect(result.error).toContain("refund");

      // Should have attempted refund
      expect(RefundService.processRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: expect.stringContaining("temp_"),
          paymentProvider: "stripe",
          amount: 100.00,
          reason: "Order creation failed after retry attempts",
        })
      );
    });

    /**
     * PROBLEM: Order creation fails AND refund also fails
     * This is the WORST possible scenario
     *
     * EXPECTED SOLUTION: Create refund_failures alert for manual intervention
     * Return clear error message to user with support contact info
     *
     * IMPACT: Customer charged, no order, no refund. Requires immediate manual action.
     */
    it("should handle scenario where both order creation and refund fail", async () => {
      // Mock order creation to fail
      vi.mocked(OrderService.createOrderFromCart).mockRejectedValue(
        new Error("Database timeout")
      );

      // Mock refund to also fail
      vi.mocked(RefundService.processRefund).mockRejectedValue(
        new Error("Stripe API unavailable")
      );

      const input: FulfillmentInput = {
        user: mockUser as any,
        cart: mockCart as any,
        lineItems: mockLineItems,
        shippingAddress: mockShippingAddress,
        payment: mockPayment,
        orderAmount: 150.00,
      };

      const result = await OrderFulfillmentService.fulfill(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();

      // Should have attempted both order creation and refund
      expect(OrderService.createOrderFromCart).toHaveBeenCalled();
      expect(RefundService.processRefund).toHaveBeenCalled();

      // Error message should mention refund was initiated
      expect(result.error).toContain("refund");
    });

    /**
     * PROBLEM: First order creation attempt fails, second succeeds
     * Need to ensure retry logic works correctly
     *
     * EXPECTED SOLUTION: Retry with exponential backoff, return order ID from successful attempt
     *
     * IMPACT: Delayed order creation but ultimately successful
     */
    it("should successfully create order on retry after initial failure", async () => {
      // First call fails, second succeeds
      vi.mocked(OrderService.createOrderFromCart)
        .mockRejectedValueOnce(new Error("Temporary network error"))
        .mockResolvedValueOnce("order_123");

      vi.mocked(PrintifyService.createPrintifyOrder).mockResolvedValue({
        success: true,
        order: { id: "printify_123" },
      } as any);

      vi.mocked(CartService.clearCart).mockResolvedValue(undefined);

      const input: FulfillmentInput = {
        user: mockUser as any,
        cart: mockCart as any,
        lineItems: mockLineItems,
        shippingAddress: mockShippingAddress,
        payment: mockPayment,
        orderAmount: 100.00,
      };

      const result = await OrderFulfillmentService.fulfill(input);

      expect(result.success).toBe(true);
      expect(result.orderId).toBe("order_123");

      // Should have retried order creation
      expect(OrderService.createOrderFromCart).toHaveBeenCalledTimes(2);
    });
  });

  /**
   * ========================================================================
   * EDGE CASE: Printify Order Creation Failures
   * ========================================================================
   */

  describe("Printify Order Creation", () => {
    /**
     * PROBLEM: Order created successfully but Printify order creation fails
     * Order exists in DB but nothing sent to production
     *
     * EXPECTED SOLUTION: Return error but include orderId
     * Do NOT refund (order was successfully created)
     * Mark for manual Printify submission
     *
     * IMPACT: Order stuck in pending, needs manual fulfillment
     */
    it("should not refund when order created but Printify fails", async () => {
      vi.mocked(OrderService.createOrderFromCart).mockResolvedValue("order_123");

      vi.mocked(PrintifyService.createPrintifyOrder).mockRejectedValue(
        new Error("Printify API timeout")
      );

      const input: FulfillmentInput = {
        user: mockUser as any,
        cart: mockCart as any,
        lineItems: mockLineItems,
        shippingAddress: mockShippingAddress,
        payment: mockPayment,
        orderAmount: 100.00,
      };

      const result = await OrderFulfillmentService.fulfill(input);

      expect(result.success).toBe(false);
      expect(result.orderId).toBe("order_123"); // Order was created!
      expect(result.error).toContain("production");

      // Should NOT have attempted refund
      expect(RefundService.processRefund).not.toHaveBeenCalled();
    });

    /**
     * PROBLEM: Printify API rate limit exceeded
     * Too many concurrent orders
     *
     * EXPECTED SOLUTION: Queue for retry with backoff
     *
     * IMPACT: Order delayed but not lost
     */
    it("should handle Printify rate limiting", async () => {
      vi.mocked(OrderService.createOrderFromCart).mockResolvedValue("order_456");

      vi.mocked(PrintifyService.createPrintifyOrder).mockRejectedValue(
        new Error("Rate limit exceeded. Try again in 60 seconds.")
      );

      const input: FulfillmentInput = {
        user: mockUser as any,
        cart: mockCart as any,
        lineItems: mockLineItems,
        shippingAddress: mockShippingAddress,
        payment: mockPayment,
        orderAmount: 75.00,
      };

      const result = await OrderFulfillmentService.fulfill(input);

      expect(result.success).toBe(false);
      expect(result.orderId).toBe("order_456");
      expect(result.error).toBeTruthy();
    });
  });

  /**
   * ========================================================================
   * EDGE CASE: Order Status Update Failures
   * ========================================================================
   */

  describe("Status Update Failures", () => {
    /**
     * PROBLEM: Printify order succeeds but status update to "confirmed" fails
     * Order is in Printify system but DB shows wrong status
     *
     * EXPECTED SOLUTION: Log error but still return success
     * Create reconciliation alert for later cleanup
     *
     * IMPACT: Order dashboard shows wrong status but product ships normally
     */
    it("should succeed even if status update fails after Printify success", async () => {
      vi.mocked(OrderService.createOrderFromCart).mockResolvedValue("order_789");

      vi.mocked(PrintifyService.createPrintifyOrder).mockResolvedValue({
        success: true,
        order: { id: "printify_789" },
      } as any);

      vi.mocked(OrderService.updateOrderStatus).mockRejectedValue(
        new Error("Database connection lost during status update")
      );

      vi.mocked(CartService.clearCart).mockResolvedValue(undefined);

      const input: FulfillmentInput = {
        user: mockUser as any,
        cart: mockCart as any,
        lineItems: mockLineItems,
        shippingAddress: mockShippingAddress,
        payment: mockPayment,
        orderAmount: 120.00,
      };

      const result = await OrderFulfillmentService.fulfill(input);

      // Should still report success because Printify order was created
      expect(result.success).toBe(true);
      expect(result.orderId).toBe("order_789");

      // Should have attempted status update (but it failed)
      expect(OrderService.updateOrderStatus).toHaveBeenCalled();
    });
  });

  /**
   * ========================================================================
   * EDGE CASE: Cart Clearing Failures
   * ========================================================================
   */

  describe("Cart Clearing", () => {
    /**
     * PROBLEM: Cart clear fails (non-critical operation)
     *
     * EXPECTED SOLUTION: Log error but still return success
     * Cart can be manually cleared later
     *
     * IMPACT: Cart still has items but order was placed successfully
     */
    it("should succeed even if cart clear fails", async () => {
      vi.mocked(OrderService.createOrderFromCart).mockResolvedValue("order_999");

      vi.mocked(PrintifyService.createPrintifyOrder).mockResolvedValue({
        success: true,
        order: { id: "printify_999" },
      } as any);

      vi.mocked(CartService.clearCart).mockRejectedValue(
        new Error("Cart not found") // Already cleared by another session?
      );

      const input: FulfillmentInput = {
        user: mockUser as any,
        cart: mockCart as any,
        lineItems: mockLineItems,
        shippingAddress: mockShippingAddress,
        payment: mockPayment,
        orderAmount: 85.00,
      };

      const result = await OrderFulfillmentService.fulfill(input);

      expect(result.success).toBe(true);
      expect(result.orderId).toBe("order_999");

      // Cart clear attempted but failed (non-critical)
      expect(CartService.clearCart).toHaveBeenCalled();
    });
  });

  /**
   * ========================================================================
   * EDGE CASE: Test Mode Handling
   * ========================================================================
   */

  describe("Test Mode", () => {
    /**
     * PROBLEM: Test mode flag passed incorrectly
     *
     * EXPECTED SOLUTION: Respect isTestMode flag, pass to Printify
     *
     * IMPACT: Test orders in production or vice versa
     */
    it("should respect test mode flag", async () => {
      vi.mocked(OrderService.createOrderFromCart).mockResolvedValue("order_test");

      const mockCreatePrintifyOrder = vi.mocked(PrintifyService.createPrintifyOrder)
        .mockResolvedValue({
          success: true,
          order: { id: "printify_test" },
        } as any);

      vi.mocked(CartService.clearCart).mockResolvedValue(undefined);

      const input: FulfillmentInput = {
        user: mockUser as any,
        cart: mockCart as any,
        lineItems: mockLineItems,
        shippingAddress: mockShippingAddress,
        payment: mockPayment,
        orderAmount: 50.00,
        isTestMode: true, // Test mode enabled
      };

      const result = await OrderFulfillmentService.fulfill(input);

      expect(result.success).toBe(true);

      // Should have passed is_test: true to Printify
      expect(mockCreatePrintifyOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          is_test: true,
        })
      );
    });
  });

  /**
   * ========================================================================
   * EDGE CASE: Concurrent Fulfillment Attempts
   * ========================================================================
   */

  describe("Concurrency Issues", () => {
    /**
     * PROBLEM: Multiple fulfill() calls for same payment
     * (e.g., webhook and frontend both trigger fulfillment)
     *
     * EXPECTED SOLUTION: First call creates order, second call should be idempotent
     *
     * IMPACT: Duplicate orders if not handled properly
     */
    it("should handle concurrent fulfillment attempts", async () => {
      let callCount = 0;

      vi.mocked(OrderService.createOrderFromCart).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return "order_concurrent_1";
        }
        // Second call should ideally check for existing order by idempotency key
        // and return the same order_id
        throw new Error("Duplicate order creation attempt");
      });

      vi.mocked(PrintifyService.createPrintifyOrder).mockResolvedValue({
        success: true,
        order: { id: "printify_concurrent" },
      } as any);

      vi.mocked(CartService.clearCart).mockResolvedValue(undefined);

      const input: FulfillmentInput = {
        user: mockUser as any,
        cart: mockCart as any,
        lineItems: mockLineItems,
        shippingAddress: mockShippingAddress,
        payment: mockPayment,
        orderAmount: 100.00,
      };

      // First fulfillment
      const result1 = await OrderFulfillmentService.fulfill(input);
      expect(result1.success).toBe(true);
      expect(result1.orderId).toBe("order_concurrent_1");

      // Second fulfillment (should fail or be idempotent)
      const result2 = await OrderFulfillmentService.fulfill(input);

      // Currently fails, but ideally should be idempotent
      expect(result2.success).toBe(false);
    });
  });

  /**
   * ========================================================================
   * EDGE CASE: Invalid Input Data
   * ========================================================================
   */

  describe("Input Validation", () => {
    /**
     * PROBLEM: Empty line items array
     *
     * EXPECTED SOLUTION: Fail fast with clear error
     *
     * IMPACT: Prevents creating order with no items
     */
    it("should handle empty line items", async () => {
      const input: FulfillmentInput = {
        user: mockUser as any,
        cart: mockCart as any,
        lineItems: [], // Empty!
        shippingAddress: mockShippingAddress,
        payment: mockPayment,
        orderAmount: 0,
      };

      const result = await OrderFulfillmentService.fulfill(input);

      expect(result.success).toBe(false);
      // Should fail without calling any services
      expect(OrderService.createOrderFromCart).not.toHaveBeenCalled();
    });

    /**
     * PROBLEM: Null or invalid shipping address
     *
     * EXPECTED SOLUTION: Validate before processing
     *
     * IMPACT: Prevents invalid Printify orders
     */
    it("should handle invalid shipping address", async () => {
      const input: FulfillmentInput = {
        user: mockUser as any,
        cart: mockCart as any,
        lineItems: mockLineItems,
        shippingAddress: null as any, // Invalid!
        payment: mockPayment,
        orderAmount: 100.00,
      };

      const result = await OrderFulfillmentService.fulfill(input);

      expect(result.success).toBe(false);
    });
  });
});
