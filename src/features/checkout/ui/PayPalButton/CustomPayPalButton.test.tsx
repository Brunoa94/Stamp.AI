import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { CustomPayPalButton } from "./CustomPayPalButton";
import { CheckoutStorageService } from "../../lib/services/checkoutStorageService";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import type { CartWithItems } from "@/types/cart";
import type { CheckoutFormData } from "../../lib/context/CheckoutFormContext";

// Mock the payment queries
const mockPreparePayPal = vi.fn();
vi.mock("../../lib/queries/paymentQueries", () => ({
  usePreparePayPalPayment: () => ({
    mutateAsync: mockPreparePayPal,
    isPending: false,
  }),
}));

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

const mockCart: CartWithItems = {
  id: "cart-123",
  user_id: "user-123",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  cart_items: [
    {
      id: "item-1",
      cart_id: "cart-123",
      product_id: "prod-123",
      variant_id: 1,
      quantity: 2,
      price: 50,
      customization: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product_title: "Test Product",
      variant_title: "Test Variant",
      image_url: "https://example.com/image.jpg",
      print_areas: {},
    },
  ],
};

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const methods = useForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: "paypal",
      billing: mockShippingAddress,
      useShippingAddress: false,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...methods}>{children}</FormProvider>
    </QueryClientProvider>
  );
}

describe("CustomPayPalButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockLocation.href = "";
  });

  it("renders the PayPal button with correct label", () => {
    render(
      <TestWrapper>
        <CustomPayPalButton
          cart={mockCart}
          cartId="cart-123"
          amount={99.99}
        />
      </TestWrapper>
    );

    expect(screen.getByRole("button")).toHaveTextContent(
      "Confirm Order • Pay with PayPal"
    );
  });

  it("renders mobile label when variant is mobile", () => {
    render(
      <TestWrapper>
        <CustomPayPalButton
          cart={mockCart}
          cartId="cart-123"
          amount={99.99}
          variant="mobile"
        />
      </TestWrapper>
    );

    expect(screen.getByRole("button")).toHaveTextContent(
      "Confirm Order • PayPal"
    );
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <TestWrapper>
        <CustomPayPalButton
          cart={mockCart}
          cartId="cart-123"
          amount={99.99}
          disabled={true}
        />
      </TestWrapper>
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls mutation and redirects on successful order creation", async () => {
    mockPreparePayPal.mockResolvedValueOnce({
      approvalUrl: "https://www.paypal.com/checkout?token=ORDER-123",
    });

    render(
      <TestWrapper>
        <CustomPayPalButton
          cart={mockCart}
          cartId="cart-123"
          amount={99.99}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockPreparePayPal).toHaveBeenCalledWith({
        formData: expect.objectContaining({
          paymentMethod: "paypal",
          billing: mockShippingAddress,
        }),
        cart: mockCart,
        cartId: "cart-123",
        amount: 99.99,
      });
    });

    await waitFor(() => {
      expect(mockLocation.href).toBe(
        "https://www.paypal.com/checkout?token=ORDER-123"
      );
    });
  });

  it("handles errors from mutation gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockPreparePayPal.mockRejectedValueOnce(new Error("Payment failed"));

    render(
      <TestWrapper>
        <CustomPayPalButton
          cart={mockCart}
          cartId="cart-123"
          amount={99.99}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockPreparePayPal).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "PayPal checkout error:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});

describe("PayPal Checkout Data Storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("CheckoutStorageService.getPayPalCheckoutData returns null when no data stored", () => {
    const data = CheckoutStorageService.getPayPalCheckoutData();
    expect(data).toBeNull();
  });

  it("CheckoutStorageService.getPayPalCheckoutData returns data when valid data exists", () => {
    const testData = {
      billing: mockShippingAddress,
      shippingAddress: mockShippingAddress,
      lineItems: [],
      cartId: "cart-123",
      paymentMethod: "paypal" as const,
      amount: 50.0,
      timestamp: Date.now(),
    };

    localStorage.setItem("paypal_checkout_data", JSON.stringify(testData));

    const data = CheckoutStorageService.getPayPalCheckoutData();
    expect(data).not.toBeNull();
    expect(data?.cartId).toBe("cart-123");
    expect(data?.amount).toBe(50.0);
  });

  it("CheckoutStorageService.getPayPalCheckoutData returns null when data is expired", () => {
    const testData = {
      billing: mockShippingAddress,
      shippingAddress: mockShippingAddress,
      lineItems: [],
      cartId: "cart-123",
      paymentMethod: "paypal" as const,
      amount: 50.0,
      timestamp: Date.now() - 61 * 60 * 1000, // 61 minutes ago (expired)
    };

    localStorage.setItem("paypal_checkout_data", JSON.stringify(testData));

    const data = CheckoutStorageService.getPayPalCheckoutData();
    expect(data).toBeNull();
    // Should also clear the expired data
    expect(localStorage.getItem("paypal_checkout_data")).toBeNull();
  });

  it("CheckoutStorageService.clearPayPalCheckoutData removes data from localStorage", () => {
    localStorage.setItem("paypal_checkout_data", JSON.stringify({ test: true }));

    CheckoutStorageService.clearPayPalCheckoutData();

    expect(localStorage.getItem("paypal_checkout_data")).toBeNull();
  });

  it("should store and retrieve checkout data correctly", () => {
    const testData = {
      billing: mockShippingAddress,
      shippingAddress: mockShippingAddress,
      lineItems: [],
      cartId: "cart-456",
      paymentMethod: "paypal" as const,
      amount: 75.0,
      timestamp: Date.now(),
    };

    CheckoutStorageService.savePayPalCheckoutData(testData);

    const storedData = CheckoutStorageService.getPayPalCheckoutData();
    expect(storedData).not.toBeNull();
    expect(storedData?.cartId).toBe("cart-456");
    expect(storedData?.amount).toBe(75.0);
  });

  it("should handle missing cartId gracefully", () => {
    const testData = {
      billing: mockShippingAddress,
      shippingAddress: mockShippingAddress,
      lineItems: [],
      cartId: null,
      paymentMethod: "paypal" as const,
      amount: 50.0,
      timestamp: Date.now(),
    };

    localStorage.setItem("paypal_checkout_data", JSON.stringify(testData));

    const storedData = CheckoutStorageService.getPayPalCheckoutData();
    expect(storedData).not.toBeNull();
    expect(storedData?.cartId).toBeNull();

    // Clearing should work regardless of cartId state
    CheckoutStorageService.clearPayPalCheckoutData();
    expect(CheckoutStorageService.getPayPalCheckoutData()).toBeNull();
  });
});
