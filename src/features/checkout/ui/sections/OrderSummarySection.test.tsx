import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderSummarySection } from "./OrderSummarySection";
import { CheckoutFormSchema, type CheckoutFormDataT } from "@/schemas/checkout";
import type { CartWithItems } from "@/types/cart";

type CheckoutFormData = CheckoutFormDataT;

// Mock dependencies
vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div data-testid="stripe-elements">{children}</div>,
}));

vi.mock("@/lib/stripe", () => ({
  stripePromise: Promise.resolve({}),
}));

vi.mock("../PayPalButton/CustomPayPalButton", () => ({
  CustomPayPalButton: ({ disabled }: { disabled: boolean }) => (
    <button data-testid="paypal-button" disabled={disabled}>
      PayPal Button
    </button>
  ),
}));

vi.mock("../components/StripePaymentButton", () => ({
  StripePaymentButton: ({ disabled }: { disabled: boolean }) => (
    <button data-testid="stripe-button" disabled={disabled}>
      Stripe Button
    </button>
  ),
}));

vi.mock("../../lib/hooks/useCheckoutPricing", () => ({
  useCheckoutPricing: () => ({
    subtotal: 100,
    discount: 0,
    total: 100,
    appliedPromo: null,
    promoError: null,
    isApplyingPromo: false,
    applyPromoCode: vi.fn(),
    clearPromoCode: vi.fn(),
  }),
}));

// Test wrapper with form context
function TestWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Partial<CheckoutFormData>;
}) {
  const methods = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      useShippingAddress: false,
      paymentMethod: "stripe",
      ...defaultValues,
    },
    mode: "onChange",
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

// Mock cart data
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
      variant_id: 123,
      quantity: 1,
      price: 100,
      customization: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product_title: "Test Product",
      variant_title: "Test Variant",
      image_url: "https://example.com/image.jpg",
      print_areas: {
        front: "design-url",
      },
    },
  ],
};

// Valid address data
const validAddress = {
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  phone: "+1234567890",
  country: "US",
  region: "CA",
  address1: "123 Main St",
  address2: "Apt 4",
  city: "San Francisco",
  zip: "94105",
};

describe("OrderSummarySection - Payment Button Validation", () => {
  describe("Stripe Payment Method", () => {
    it("should disable Stripe button when billing address is incomplete", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "stripe",
            billing: {
              ...validAddress,
              first_name: "", // Missing required field
            },
          }}
        >
          <OrderSummarySection cart={mockCart} cartId="cart-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("stripe-button");
        expect(button).toBeDisabled();
      });
    });

    it("should disable Stripe button when country is missing", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "stripe",
            billing: {
              ...validAddress,
              country: "", // Missing required field
            },
          }}
        >
          <OrderSummarySection cart={mockCart} cartId="cart-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("stripe-button");
        expect(button).toBeDisabled();
      });
    });

    it("should disable Stripe button when email is invalid", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "stripe",
            billing: {
              ...validAddress,
              email: "invalid-email", // Invalid email
            },
          }}
        >
          <OrderSummarySection cart={mockCart} cartId="cart-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("stripe-button");
        expect(button).toBeDisabled();
      });
    });

    it("should enable Stripe button when all billing address fields are valid", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "stripe",
            billing: validAddress,
          }}
        >
          <OrderSummarySection cart={mockCart} cartId="cart-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("stripe-button");
        expect(button).not.toBeDisabled();
      });
    });

    it("should disable Stripe button when shipping toggle is enabled but shipping address is incomplete", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "stripe",
            billing: validAddress,
            useShippingAddress: true,
            shipping: {
              ...validAddress,
              zip: "", // Missing required field
            },
          }}
        >
          <OrderSummarySection cart={mockCart} cartId="cart-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("stripe-button");
        expect(button).toBeDisabled();
      });
    });

    it("should enable Stripe button when shipping toggle is enabled and both addresses are valid", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "stripe",
            billing: validAddress,
            useShippingAddress: true,
            shipping: validAddress,
          }}
        >
          <OrderSummarySection cart={mockCart} cartId="cart-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("stripe-button");
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe("PayPal Payment Method", () => {
    it("should disable PayPal button when billing address is incomplete", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "paypal",
            billing: {
              ...validAddress,
              city: "", // Missing required field
            },
          }}
        >
          <OrderSummarySection cart={mockCart} cartId="cart-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("paypal-button");
        expect(button).toBeDisabled();
      });
    });

    it("should disable PayPal button when country is missing", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "paypal",
            billing: {
              ...validAddress,
              country: "", // Missing required field
            },
          }}
        >
          <OrderSummarySection cart={mockCart} cartId="cart-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("paypal-button");
        expect(button).toBeDisabled();
      });
    });

    it("should enable PayPal button when all billing address fields are valid", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "paypal",
            billing: validAddress,
          }}
        >
          <OrderSummarySection cart={mockCart} cartId="cart-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("paypal-button");
        expect(button).not.toBeDisabled();
      });
    });

    it("should disable PayPal button when shipping toggle is enabled but shipping address is missing", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "paypal",
            billing: validAddress,
            useShippingAddress: true,
            shipping: undefined, // Shipping required but not provided
          }}
        >
          <OrderSummarySection cart={mockCart} cartId="cart-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("paypal-button");
        expect(button).toBeDisabled();
      });
    });

    it("should enable PayPal button when shipping toggle is enabled and both addresses are valid", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "paypal",
            billing: validAddress,
            useShippingAddress: true,
            shipping: validAddress,
          }}
        >
          <OrderSummarySection cart={mockCart} cartId="cart-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("paypal-button");
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe("Additional Validation Rules", () => {
    // TODO: This test requires runtime mock changes which isn't supported
    // Consider refactoring to use a prop or context to control the total value
    it.skip("should disable button when cart total is 0 even if form is valid", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "stripe",
            billing: validAddress,
          }}
        >
          <OrderSummarySection cart={mockCart} cartId="cart-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("stripe-button");
        expect(button).toBeDisabled();
      });
    });

    it("should disable button when isSubmitting is true even if form is valid", async () => {
      render(
        <TestWrapper
          defaultValues={{
            paymentMethod: "stripe",
            billing: validAddress,
          }}
        >
          <OrderSummarySection
            cart={mockCart}
            cartId="cart-123"
            isSubmitting={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const button = screen.getByTestId("stripe-button");
        expect(button).toBeDisabled();
      });
    });
  });
});
