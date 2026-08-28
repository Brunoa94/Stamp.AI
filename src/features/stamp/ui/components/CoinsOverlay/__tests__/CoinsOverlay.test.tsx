import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoinsOverlay } from "../CoinsOverlay";

/**
 * ========================================================================
 * CoinsOverlay Component Tests
 * ========================================================================
 * Tests for the overlay shown when the user cannot generate.
 *
 * The auth entry points are the shared Login/Register dialogs. Their wiring
 * is covered by AuthDialog's own test (features/auth/components/__tests__);
 * here they are stubbed so this stays a focused unit test of the overlay and
 * doesn't drag in the react-query / router providers those dialogs need.
 * NOTE: the stubs only assert the overlay *renders* the auth entry points —
 * dialog-open behavior is AuthDialog's test, not this one.
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
      proceedWithUploadedImage: "Proceed without editing my photo",
      proceedWithCachedImages: "Proceed with previous generated photos",
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

    it("should render skip button when onSkip is provided with hasUploadedImage", () => {
      const mockOnSkip = vi.fn();
      render(
        <CoinsOverlay
          variant="no-coins"
          onSkip={mockOnSkip}
          hasUploadedImage={true}
        />,
      );

      expect(
        screen.getByRole("button", { name: /proceed without editing my photo/i }),
      ).toBeInTheDocument();
    });

    it("should render skip button when onSkip is provided with hasCachedImages", () => {
      const mockOnSkip = vi.fn();
      render(
        <CoinsOverlay
          variant="no-coins"
          onSkip={mockOnSkip}
          hasCachedImages={true}
        />,
      );

      expect(
        screen.getByRole("button", { name: /proceed with previous generated photos/i }),
      ).toBeInTheDocument();
    });

    it("should not render skip button when onSkip is not provided", () => {
      render(<CoinsOverlay variant="no-coins" />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should not render skip button when neither uploaded nor cached images exist", () => {
      const mockOnSkip = vi.fn();
      render(
        <CoinsOverlay
          variant="no-coins"
          onSkip={mockOnSkip}
          hasUploadedImage={false}
          hasCachedImages={false}
        />,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should call onSkip when skip button is clicked", () => {
      const mockOnSkip = vi.fn();
      render(
        <CoinsOverlay
          variant="no-coins"
          onSkip={mockOnSkip}
          hasUploadedImage={true}
        />,
      );

      const skipButton = screen.getByRole("button", {
        name: /proceed without editing my photo/i,
      });
      fireEvent.click(skipButton);

      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });
  });

  describe("NoCoinsOverlay three-state button (priority logic)", () => {
    it("should show 'Proceed without editing my photo' when hasUploadedImage=true (priority 1)", () => {
      const mockOnSkip = vi.fn();
      render(
        <CoinsOverlay
          variant="no-coins"
          onSkip={mockOnSkip}
          hasUploadedImage={true}
          hasCachedImages={false}
        />,
      );

      expect(
        screen.getByRole("button", { name: /proceed without editing my photo/i }),
      ).toBeInTheDocument();
    });

    it("should show uploaded image button even when both uploaded and cached exist (priority test)", () => {
      const mockOnSkip = vi.fn();
      render(
        <CoinsOverlay
          variant="no-coins"
          onSkip={mockOnSkip}
          hasUploadedImage={true}
          hasCachedImages={true}
        />,
      );

      expect(
        screen.getByRole("button", { name: /proceed without editing my photo/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /proceed with previous generated/i }),
      ).not.toBeInTheDocument();
    });

    it("should show 'Proceed with previous generated photos' when hasCachedImages=true and no upload", () => {
      const mockOnSkip = vi.fn();
      render(
        <CoinsOverlay
          variant="no-coins"
          onSkip={mockOnSkip}
          hasUploadedImage={false}
          hasCachedImages={true}
        />,
      );

      expect(
        screen.getByRole("button", { name: /proceed with previous generated photos/i }),
      ).toBeInTheDocument();
    });

    it("should not render skip button when neither hasUploadedImage nor hasCachedImages", () => {
      const mockOnSkip = vi.fn();
      render(
        <CoinsOverlay
          variant="no-coins"
          onSkip={mockOnSkip}
          hasUploadedImage={false}
          hasCachedImages={false}
        />,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should call onSkip when uploaded image button is clicked", () => {
      const mockOnSkip = vi.fn();
      render(
        <CoinsOverlay
          variant="no-coins"
          onSkip={mockOnSkip}
          hasUploadedImage={true}
        />,
      );

      const button = screen.getByRole("button", { name: /proceed without editing my photo/i });
      fireEvent.click(button);

      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });

    it("should call onSkip when cached images button is clicked", () => {
      const mockOnSkip = vi.fn();
      render(
        <CoinsOverlay
          variant="no-coins"
          onSkip={mockOnSkip}
          hasUploadedImage={false}
          hasCachedImages={true}
        />,
      );

      const button = screen.getByRole("button", { name: /proceed with previous generated photos/i });
      fireEvent.click(button);

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
