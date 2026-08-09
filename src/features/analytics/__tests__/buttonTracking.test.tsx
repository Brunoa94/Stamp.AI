import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/features/ui/button";
import { AnalyticsService } from "@/services/analyticsService";

describe("Button tracking integration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("tracks a click when trackingId is provided", async () => {
    const trackSpy = vi
      .spyOn(AnalyticsService, "track")
      .mockImplementation(() => undefined);
    const user = userEvent.setup();

    render(
      <Button trackingId="login" trackingData={{ method: "google" }}>
        Sign in
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("login", { method: "google" });
  });

  it("still calls the provided onClick handler", async () => {
    vi.spyOn(AnalyticsService, "track").mockImplementation(() => undefined);
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button trackingId="view_cart" onClick={onClick}>
        View cart
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "View cart" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not track clicks when trackingId is absent", async () => {
    const trackSpy = vi
      .spyOn(AnalyticsService, "track")
      .mockImplementation(() => undefined);
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Plain</Button>);

    await user.click(screen.getByRole("button", { name: "Plain" }));

    expect(trackSpy).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
