import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  CustomPayPalButton,
  getStoredPayPalCheckoutData,
  clearStoredPayPalCheckoutData,
} from "./CustomPayPalButton";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
const mockLocation = {
  origin: "https://example.com",
  href: "",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

const mockShippingAddress: ShippingAddressT = {
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  phone: "1234567890",
  country: "US",
  region: "CA",
  address1: "123 Main St",
  city: "Los Angeles",
  zip: "90001",
};

const mockLineItems: PrintifyLineItem[] = [
  {
    product_id: "prod_123",
    variant_id: 1,
    quantity: 2,
  },
];

describe("CustomPayPalButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockLocation.href = "";
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders the PayPal button with correct label", () => {
    render(
      <CustomPayPalButton
        amount={99.99}
        lineItems={mockLineItems}
        shippingAddress={mockShippingAddress}
      />
    );

    expect(screen.getByRole("button")).toHaveTextContent(
      "Confirm Order • Pay with PayPal"
    );
  });

  it("renders mobile label when variant is mobile", () => {
    render(
      <CustomPayPalButton
        amount={99.99}
        lineItems={mockLineItems}
        shippingAddress={mockShippingAddress}
        variant="mobile"
      />
    );

    expect(screen.getByRole("button")).toHaveTextContent(
      "Confirm Order • PayPal"
    );
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <CustomPayPalButton
        amount={99.99}
        lineItems={mockLineItems}
        shippingAddress={mockShippingAddress}
        disabled={true}
      />
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls API and redirects on successful order creation", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          orderId: "ORDER-123",
          approvalUrl: "https://www.paypal.com/checkout?token=ORDER-123",
        }),
    });

    render(
      <CustomPayPalButton
        amount={99.99}
        lineItems={mockLineItems}
        shippingAddress={mockShippingAddress}
      />
    );

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/paypal/create-order",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    await waitFor(() => {
      expect(mockLocation.href).toBe(
        "https://www.paypal.com/checkout?token=ORDER-123"
      );
    });

    // Check that checkout data was stored
    const storedData = getStoredPayPalCheckoutData();
    expect(storedData).not.toBeNull();
    expect(storedData?.orderId).toBe("ORDER-123");
    expect(storedData?.amount).toBe(99.99);
  });

  it("shows loading state during API call", async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(pendingPromise);

    render(
      <CustomPayPalButton
        amount={99.99}
        lineItems={mockLineItems}
        shippingAddress={mockShippingAddress}
      />
    );

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent(
        "Redirecting to PayPal..."
      );
    });

    // Cleanup
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ orderId: "123", approvalUrl: "http://test" }),
    });
  });

  it("calls onError when API fails", async () => {
    const onError = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Server error" }),
    });

    render(
      <CustomPayPalButton
        amount={99.99}
        lineItems={mockLineItems}
        shippingAddress={mockShippingAddress}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Server error");
    });
  });

  it("calls onError when response is missing required fields", async () => {
    const onError = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }), // Missing orderId and approvalUrl
    });

    render(
      <CustomPayPalButton
        amount={99.99}
        lineItems={mockLineItems}
        shippingAddress={mockShippingAddress}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Invalid response from server");
    });
  });
});

describe("PayPal Checkout Data Storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("getStoredPayPalCheckoutData returns null when no data stored", () => {
    const data = getStoredPayPalCheckoutData();
    expect(data).toBeNull();
  });

  it("getStoredPayPalCheckoutData returns data when valid data exists", () => {
    const testData = {
      orderId: "ORDER-123",
      amount: 50.0,
      lineItems: mockLineItems,
      shippingAddress: mockShippingAddress,
      cartId: "cart-123",
      timestamp: Date.now(),
    };

    localStorage.setItem("paypal_checkout_data", JSON.stringify(testData));

    const data = getStoredPayPalCheckoutData();
    expect(data).not.toBeNull();
    expect(data?.orderId).toBe("ORDER-123");
    expect(data?.cartId).toBe("cart-123");
  });

  it("getStoredPayPalCheckoutData returns null when data is expired", () => {
    const testData = {
      orderId: "ORDER-123",
      amount: 50.0,
      lineItems: mockLineItems,
      shippingAddress: mockShippingAddress,
      cartId: "cart-123",
      timestamp: Date.now() - 31 * 60 * 1000, // 31 minutes ago
    };

    localStorage.setItem("paypal_checkout_data", JSON.stringify(testData));

    const data = getStoredPayPalCheckoutData();
    expect(data).toBeNull();
    // Should also clear the expired data
    expect(localStorage.getItem("paypal_checkout_data")).toBeNull();
  });

  it("clearStoredPayPalCheckoutData removes data from localStorage", () => {
    localStorage.setItem("paypal_checkout_data", JSON.stringify({ test: true }));

    clearStoredPayPalCheckoutData();

    expect(localStorage.getItem("paypal_checkout_data")).toBeNull();
  });

  it("should clear checkout data when cartId is missing (simulating cart not found scenario)", () => {
    // Store checkout data without cartId (simulating cart not found)
    const testDataWithoutCartId = {
      orderId: "ORDER-123",
      amount: 50.0,
      lineItems: mockLineItems,
      shippingAddress: mockShippingAddress,
      cartId: null, // Cart ID is missing
      timestamp: Date.now(),
    };

    localStorage.setItem("paypal_checkout_data", JSON.stringify(testDataWithoutCartId));

    // Verify data exists
    expect(localStorage.getItem("paypal_checkout_data")).not.toBeNull();

    // Get the stored data - cartId should be null
    const storedData = getStoredPayPalCheckoutData();
    expect(storedData).not.toBeNull();
    expect(storedData?.cartId).toBeNull();

    // When cart is not found, checkout data should be cleared
    // This simulates what happens in paypal-return page when cartId is missing
    clearStoredPayPalCheckoutData();

    // Verify data was cleared
    expect(localStorage.getItem("paypal_checkout_data")).toBeNull();
    expect(getStoredPayPalCheckoutData()).toBeNull();
  });

  it("should clear checkout data when cartId is undefined", () => {
    // Store checkout data with undefined cartId
    const testDataWithUndefinedCartId = {
      orderId: "ORDER-456",
      amount: 75.0,
      lineItems: mockLineItems,
      shippingAddress: mockShippingAddress,
      // cartId is omitted (undefined)
      timestamp: Date.now(),
    };

    localStorage.setItem("paypal_checkout_data", JSON.stringify(testDataWithUndefinedCartId));

    const storedData = getStoredPayPalCheckoutData();
    expect(storedData).not.toBeNull();
    expect(storedData?.cartId).toBeUndefined();

    // Clear should work regardless of cartId state
    clearStoredPayPalCheckoutData();
    expect(getStoredPayPalCheckoutData()).toBeNull();
  });
});
