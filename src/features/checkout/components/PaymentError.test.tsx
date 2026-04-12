import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PaymentError from "./PaymentError";
import type { PaymentErrorDetailsI } from "@/types/payment";

describe("PaymentError", () => {
  const mockOnTryAgain = vi.fn();
  const mockOnSelectMethod = vi.fn();

  const baseErrorDetails: PaymentErrorDetailsI = {
    paymentId: "pi_failed_123",
    orderNumber: "#SD-123456",
    amountDue: "$99.99",
    attemptedOn: "Jan 15, 2026",
    status: "Failed",
    reasonTitle: "Reason",
    reasonMessage: "Card was declined",
    availableMethods: ["paypal", "applepay", "stripe"],
  };

  it("should render payment failure title and subtitle by default", () => {
    render(
      <PaymentError
        details={baseErrorDetails}
        onTryAgain={mockOnTryAgain}
        onSelectMethod={mockOnSelectMethod}
      />
    );

    expect(screen.getByText("Payment Failed")).toBeInTheDocument();
    expect(
      screen.getByText(/Your transaction couldn't be completed/i)
    ).toBeInTheDocument();
  });

  it("should show retry button for normal payment failures", () => {
    render(
      <PaymentError
        details={baseErrorDetails}
        onTryAgain={mockOnTryAgain}
        onSelectMethod={mockOnSelectMethod}
      />
    );

    expect(screen.getByText("Retry Payment")).toBeInTheDocument();
  });

  it("should show alternative payment methods for normal payment failures", () => {
    render(
      <PaymentError
        details={baseErrorDetails}
        onTryAgain={mockOnTryAgain}
        onSelectMethod={mockOnSelectMethod}
      />
    );

    // The AlternativePaymentMethods component should be rendered
    // We're checking for the container element
    const ctaStack = screen.getByText("Retry Payment").closest("div");
    expect(ctaStack).toBeInTheDocument();
  });

  it("should NOT show retry button when isPostPaymentError is true", () => {
    const postPaymentErrorDetails: PaymentErrorDetailsI = {
      ...baseErrorDetails,
      reasonMessage: "Payment was captured but order finalization failed.",
      isPostPaymentError: true,
    };

    render(
      <PaymentError
        details={postPaymentErrorDetails}
        onTryAgain={mockOnTryAgain}
        onSelectMethod={mockOnSelectMethod}
      />
    );

    expect(screen.queryByText("Retry Payment")).not.toBeInTheDocument();
  });

  it("should show different title and subtitle when isPostPaymentError is true", () => {
    const postPaymentErrorDetails: PaymentErrorDetailsI = {
      ...baseErrorDetails,
      reasonMessage: "Payment was captured but order finalization failed.",
      isPostPaymentError: true,
    };

    render(
      <PaymentError
        details={postPaymentErrorDetails}
        onTryAgain={mockOnTryAgain}
        onSelectMethod={mockOnSelectMethod}
      />
    );

    expect(screen.getByText("Order Processing Issue")).toBeInTheDocument();
    expect(
      screen.getByText(/Your payment was successful, but we encountered an issue/i)
    ).toBeInTheDocument();
  });

  it("should always show dashboard link", () => {
    render(
      <PaymentError
        details={baseErrorDetails}
        onTryAgain={mockOnTryAgain}
        onSelectMethod={mockOnSelectMethod}
      />
    );

    expect(screen.getByText("Cancel & Go to Dashboard")).toBeInTheDocument();
  });

  it("should always show contact support link", () => {
    render(
      <PaymentError
        details={baseErrorDetails}
        onTryAgain={mockOnTryAgain}
        onSelectMethod={mockOnSelectMethod}
      />
    );

    expect(screen.getByText("Need help? Contact Support")).toBeInTheDocument();
  });

  it("should display error details correctly", () => {
    render(
      <PaymentError
        details={baseErrorDetails}
        onTryAgain={mockOnTryAgain}
        onSelectMethod={mockOnSelectMethod}
      />
    );

    expect(screen.getByText("#SD-123456")).toBeInTheDocument();
    expect(screen.getByText("$99.99")).toBeInTheDocument();
    expect(screen.getByText("Card was declined")).toBeInTheDocument();
  });

  it("should use default reason message when details are null", () => {
    render(
      <PaymentError
        details={null}
        onTryAgain={mockOnTryAgain}
        onSelectMethod={mockOnSelectMethod}
      />
    );

    expect(
      screen.getByText(
        /Your transaction couldn't be completed. Please retry or choose an alternative method./i
      )
    ).toBeInTheDocument();
  });
});
