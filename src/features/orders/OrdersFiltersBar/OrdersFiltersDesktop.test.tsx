import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OrdersFiltersDesktop } from "./OrdersFiltersDesktop";
import { STATUS_FILTERS, TIMEFRAME_OPTIONS } from "@/constants/orders";

describe("OrdersFiltersDesktop", () => {
  const defaultProps = {
    selectedStatus: "all" as const,
    onStatusChange: vi.fn(),
    selectedTimeframe: "last-30" as const,
    onTimeframeChange: vi.fn(),
  };

  it("renders timeframe and status labels", () => {
    render(<OrdersFiltersDesktop {...defaultProps} />);
    expect(screen.getByText("Timeframe:")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
  });

  it("displays the selected timeframe value", () => {
    render(<OrdersFiltersDesktop {...defaultProps} />);
    const expectedLabel = TIMEFRAME_OPTIONS.find(
      (opt) => opt.value === defaultProps.selectedTimeframe
    )?.label;
    expect(screen.getByText(expectedLabel!)).toBeInTheDocument();
  });

  it("displays the selected status value", () => {
    render(<OrdersFiltersDesktop {...defaultProps} />);
    const expectedLabel = STATUS_FILTERS.find(
      (opt) => opt.value === defaultProps.selectedStatus
    )?.label;
    expect(screen.getByText(expectedLabel!)).toBeInTheDocument();
  });

  it("renders two combobox elements for timeframe and status", () => {
    render(<OrdersFiltersDesktop {...defaultProps} />);
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes).toHaveLength(2);
  });

  it("displays different selected status values correctly", () => {
    render(
      <OrdersFiltersDesktop {...defaultProps} selectedStatus="pending" />
    );
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("displays different selected timeframe values correctly", () => {
    render(
      <OrdersFiltersDesktop {...defaultProps} selectedTimeframe="last-90" />
    );
    expect(screen.getByText("Last 90 Days")).toBeInTheDocument();
  });

  it("renders with cancelled status correctly", () => {
    render(
      <OrdersFiltersDesktop {...defaultProps} selectedStatus="cancelled" />
    );
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("renders with all-time timeframe correctly", () => {
    render(
      <OrdersFiltersDesktop {...defaultProps} selectedTimeframe="all-time" />
    );
    expect(screen.getByText("All Time")).toBeInTheDocument();
  });
});
