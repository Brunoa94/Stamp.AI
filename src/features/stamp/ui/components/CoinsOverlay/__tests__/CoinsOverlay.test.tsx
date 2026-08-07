import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoinsOverlay } from "../CoinsOverlay";

/**
 * ========================================================================
 * CoinsOverlay Component Tests
 * ========================================================================
 * Tests for the overlay shown when the user cannot generate.
 *
 * The auth entry points are the shared Login/Register dialogs (owned by the
 * auth feature and covered by their own tests); they are stubbed here so
 * this suite stays a focused unit test of the overlay itself and doesn't
 * need the react-query / router providers those dialogs pull in.
 */

vi.mock("@/features/auth/login/Login", () => ({
  Login: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="login-dialog">{children}</div>
  ),
}));

vi.mock("@/features/auth/register/Register", () => ({
  Register: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="register-dialog">{children}</div>
  ),
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
      usePreviousCreations: "Use Previous Creations",
    };
    return translations[key] || key;
  },
}));

describe("CoinsOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("LoginOverlay (not-logged-in variant)", () => {
    it("should render login message", () => {
      render(<CoinsOverlay variant="not-logged-in" />);

      expect(screen.getByText("Login or register to continue")).toBeInTheDocument();
      expect(screen.getByText("Create an account to start designing")).toBeInTheDocument();
    });

    it("should offer the Login and Register dialogs", () => {
      render(<CoinsOverlay variant="not-logged-in" />);

      expect(screen.getByTestId("login-dialog")).toBeInTheDocument();
      expect(screen.getByTestId("register-dialog")).toBeInTheDocument();
      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
    });

    it("should have correct test ID", () => {
      render(<CoinsOverlay variant="not-logged-in" />);

      expect(screen.getByTestId("coins-overlay-login")).toBeInTheDocument();
    });
  });

  describe("NoCoinsOverlay (no-coins variant)", () => {
    it("should render no coins message", () => {
      render(<CoinsOverlay variant="no-coins" />);

      expect(screen.getByText("You're out of coins for today")).toBeInTheDocument();
    });

    it("should show reset time info", () => {
      render(<CoinsOverlay variant="no-coins" />);

      expect(screen.getByText("Coins reset daily at midnight")).toBeInTheDocument();
    });

    it("should not offer the auth dialogs", () => {
      render(<CoinsOverlay variant="no-coins" />);

      expect(screen.queryByTestId("login-dialog")).not.toBeInTheDocument();
      expect(screen.queryByTestId("register-dialog")).not.toBeInTheDocument();
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

    it("should label the skip button for cached images", () => {
      const mockOnSkip = vi.fn();
      render(
        <CoinsOverlay variant="no-coins" onSkip={mockOnSkip} hasCachedImages />,
      );

      expect(
        screen.getByRole("button", { name: /use previous creations/i }),
      ).toBeInTheDocument();
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
