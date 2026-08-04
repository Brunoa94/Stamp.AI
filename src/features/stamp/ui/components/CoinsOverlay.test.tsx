import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoinsOverlay } from "./CoinsOverlay";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      notLoggedIn: "Login or register to continue",
      notLoggedInDescription: "Create an account to start designing",
      login: "Login",
      register: "Register",
      noCoins: "You're out of coins for today",
      noCoinsDescription: "Coins reset daily at midnight",
      skipGeneration: "Use My Image",
    };
    return translations[key] || key;
  },
}));

/**
 * ========================================================================
 * CoinsOverlay Component Tests
 * ========================================================================
 * Tests for the overlay components that appear when user cannot generate.
 */

describe("CoinsOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * ========================================================================
   * LoginOverlay Tests
   * ========================================================================
   */

  describe("LoginOverlay (not-logged-in variant)", () => {
    it("should render login message", () => {
      render(<CoinsOverlay variant="not-logged-in" />);

      expect(screen.getByText("Login or register to continue")).toBeInTheDocument();
      expect(screen.getByText("Create an account to start designing")).toBeInTheDocument();
    });

    it("should render Login and Register buttons", () => {
      render(<CoinsOverlay variant="not-logged-in" />);

      expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    });

    it("should navigate to /auth/login on Login click", () => {
      render(<CoinsOverlay variant="not-logged-in" />);

      const loginButton = screen.getByRole("button", { name: /login/i });
      fireEvent.click(loginButton);

      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });

    it("should navigate to /auth/register on Register click", () => {
      render(<CoinsOverlay variant="not-logged-in" />);

      const registerButton = screen.getByRole("button", { name: /register/i });
      fireEvent.click(registerButton);

      expect(mockPush).toHaveBeenCalledWith("/auth/register");
    });

    it("should have correct test ID", () => {
      render(<CoinsOverlay variant="not-logged-in" />);

      expect(screen.getByTestId("coins-overlay-login")).toBeInTheDocument();
    });
  });

  /**
   * ========================================================================
   * NoCoinsOverlay Tests
   * ========================================================================
   */

  describe("NoCoinsOverlay (no-coins variant)", () => {
    it("should render no coins message", () => {
      render(<CoinsOverlay variant="no-coins" />);

      expect(screen.getByText("You're out of coins for today")).toBeInTheDocument();
    });

    it("should show reset time info", () => {
      render(<CoinsOverlay variant="no-coins" />);

      expect(screen.getByText("Coins reset daily at midnight")).toBeInTheDocument();
    });

    it("should not render Login/Register buttons", () => {
      render(<CoinsOverlay variant="no-coins" />);

      expect(screen.queryByRole("button", { name: /login/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /register/i })).not.toBeInTheDocument();
    });

    it("should have correct test ID", () => {
      render(<CoinsOverlay variant="no-coins" />);

      expect(screen.getByTestId("coins-overlay-no-coins")).toBeInTheDocument();
    });

    it("should render skip button when onSkip is provided", () => {
      const mockOnSkip = vi.fn();
      render(<CoinsOverlay variant="no-coins" onSkip={mockOnSkip} />);

      expect(screen.getByRole("button", { name: /use my image/i })).toBeInTheDocument();
    });

    it("should not render skip button when onSkip is not provided", () => {
      render(<CoinsOverlay variant="no-coins" />);

      expect(screen.queryByRole("button", { name: /use my image/i })).not.toBeInTheDocument();
    });

    it("should call onSkip when skip button is clicked", () => {
      const mockOnSkip = vi.fn();
      render(<CoinsOverlay variant="no-coins" onSkip={mockOnSkip} />);

      const skipButton = screen.getByRole("button", { name: /use my image/i });
      fireEvent.click(skipButton);

      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * ========================================================================
   * Styling Tests
   * ========================================================================
   */

  describe("Styling", () => {
    it("should have backdrop blur class for glass effect", () => {
      render(<CoinsOverlay variant="not-logged-in" />);

      const overlay = screen.getByTestId("coins-overlay-login");
      const backdrop = overlay.querySelector(".backdrop-blur-md");

      expect(backdrop).toBeInTheDocument();
    });

    it("should be positioned absolutely", () => {
      render(<CoinsOverlay variant="not-logged-in" />);

      const overlay = screen.getByTestId("coins-overlay-login");

      expect(overlay).toHaveClass("absolute");
      expect(overlay).toHaveClass("inset-0");
    });
  });
});
