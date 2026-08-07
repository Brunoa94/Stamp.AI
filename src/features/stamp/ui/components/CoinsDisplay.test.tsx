import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CoinsDisplay } from "./CoinsDisplay";
import { useUserCoins } from "@/queries/coinsQueries";

// Mock dependencies
vi.mock("@/queries/coinsQueries");

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, number>) => {
    const translations: Record<string, string> = {
      display: `${params?.coins} Coins available`,
      displayAria: `${params?.coins} coins available`,
    };
    return translations[key] || key;
  },
}));

/**
 * ========================================================================
 * CoinsDisplay Component Tests
 * ========================================================================
 * Tests for the coins counter display component.
 */

describe("CoinsDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * ========================================================================
   * Rendering Tests
   * ========================================================================
   */

  describe("Rendering", () => {
    it("should render coins count", () => {
      vi.mocked(useUserCoins).mockReturnValue({
        data: { coins: 3, coinsResetAt: "2026-08-04" },
        isLoading: false,
      } as any);

      render(<CoinsDisplay />);

      expect(screen.getByText("3 Coins available")).toBeInTheDocument();
    });

    it("should render skeleton while loading", () => {
      vi.mocked(useUserCoins).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);

      render(<CoinsDisplay />);

      expect(screen.getByTestId("coins-display-skeleton")).toBeInTheDocument();
    });

    it("should render coins display text", () => {
      vi.mocked(useUserCoins).mockReturnValue({
        data: { coins: 5, coinsResetAt: "2026-08-04" },
        isLoading: false,
      } as any);

      render(<CoinsDisplay />);

      expect(screen.getByText("5 Coins available")).toBeInTheDocument();
    });

    it("should have correct test ID when loaded", () => {
      vi.mocked(useUserCoins).mockReturnValue({
        data: { coins: 2, coinsResetAt: "2026-08-04" },
        isLoading: false,
      } as any);

      render(<CoinsDisplay />);

      expect(screen.getByTestId("coins-display")).toBeInTheDocument();
    });
  });

  /**
   * ========================================================================
   * Accessibility Tests
   * ========================================================================
   */

  describe("Accessibility", () => {
    it("should have aria-label with coins count", () => {
      vi.mocked(useUserCoins).mockReturnValue({
        data: { coins: 4, coinsResetAt: "2026-08-04" },
        isLoading: false,
      } as any);

      render(<CoinsDisplay />);

      const display = screen.getByTestId("coins-display");
      expect(display).toHaveAttribute("aria-label", "4 coins available");
    });
  });

  /**
   * ========================================================================
   * Edge Cases Tests
   * ========================================================================
   */

  describe("Edge Cases", () => {
    it("should render 0 coins correctly", () => {
      vi.mocked(useUserCoins).mockReturnValue({
        data: { coins: 0, coinsResetAt: "2026-08-04" },
        isLoading: false,
      } as any);

      render(<CoinsDisplay />);

      expect(screen.getByText("0 Coins available")).toBeInTheDocument();
    });

    it("should handle undefined data gracefully", () => {
      vi.mocked(useUserCoins).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as any);

      render(<CoinsDisplay />);

      // Should default to 0 coins
      expect(screen.getByText("0 Coins available")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      vi.mocked(useUserCoins).mockReturnValue({
        data: { coins: 5, coinsResetAt: "2026-08-04" },
        isLoading: false,
      } as any);

      render(<CoinsDisplay className="custom-class" />);

      const display = screen.getByTestId("coins-display");
      expect(display).toHaveClass("custom-class");
    });
  });

  /**
   * ========================================================================
   * Coins Count Display Tests
   * ========================================================================
   */

  describe("Coins Count Display", () => {
    it.each([
      { coins: 5, expected: "5 Coins available" },
      { coins: 4, expected: "4 Coins available" },
      { coins: 3, expected: "3 Coins available" },
      { coins: 2, expected: "2 Coins available" },
      { coins: 1, expected: "1 Coins available" },
      { coins: 0, expected: "0 Coins available" },
    ])("should display $expected when coins is $coins", ({ coins, expected }) => {
      vi.mocked(useUserCoins).mockReturnValue({
        data: { coins, coinsResetAt: "2026-08-04" },
        isLoading: false,
      } as any);

      render(<CoinsDisplay />);

      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
