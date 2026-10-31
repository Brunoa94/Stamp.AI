import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/i18n/messages/en.json";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { AuthDialog } from "../AuthDialog";
import { DialogContent, DialogTitle } from "@/features/ui/dialog";

const mockCurrentUser = vi.hoisted(() => ({
  value: null as { id: string; is_anonymous?: boolean } | null,
}));

vi.mock("@/shared/queries/authQueries", () => ({
  useUser: () => ({ data: mockCurrentUser.value }),
}));

/**
 * Behavior test for the shared auth dialog shell: it must render the default
 * trigger, swap in a caller-owned trigger when children are given, and open
 * the form on click. Previously the Login/Register dialogs had NO tests —
 * this covers the wiring they now both share.
 *
 * The `form` is a DialogContent (as RegisterForm/LoginForm are), so Radix
 * gates its visibility on the dialog's open state.
 *
 * AuthDialog reads the current user (to auto-close on login) via useUser,
 * which needs a QueryClient; the hook is stubbed to "signed out" here since
 * these tests only cover the trigger/open wiring.
 */

vi.mock("@/queries/authQueries", () => ({
  useUser: () => ({ data: null, isLoading: false }),
}));

const FORM = (
  <DialogContent>
    <DialogTitle>Auth</DialogTitle>
    <div data-testid="auth-form">Form contents</div>
  </DialogContent>
);

describe("AuthDialog", () => {
  it("renders the default trigger when no children are given", () => {
    renderWithIntl(
      <AuthDialog
        form={FORM}
        triggerAriaLabel="Open"
        defaultTrigger={<button type="button">Default trigger</button>}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Default trigger" }),
    ).toBeInTheDocument();
  });

  it("renders a caller-owned trigger when children are given", () => {
    renderWithIntl(
      <AuthDialog
        form={FORM}
        triggerAriaLabel="Open register"
        defaultTrigger={<button type="button">Default trigger</button>}
      >
        Sign up now
      </AuthDialog>,
    );
    // The default trigger is replaced by the custom one
    expect(
      screen.queryByRole("button", { name: "Default trigger" }),
    ).not.toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: "Open register" });
    expect(trigger).toHaveTextContent("Sign up now");
  });

  it("keeps the form closed until the trigger is clicked", () => {
    renderWithIntl(
      <AuthDialog
        form={FORM}
        triggerAriaLabel="Open"
        defaultTrigger={<button type="button">Open</button>}
      />,
    );
    expect(screen.queryByTestId("auth-form")).not.toBeInTheDocument();
  });

  it("opens the form when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <AuthDialog
        form={FORM}
        triggerAriaLabel="Open"
        defaultTrigger={<button type="button">Open</button>}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByTestId("auth-form")).toBeInTheDocument();
  });

  describe("for a guest with an anonymous session", () => {
    afterEach(() => {
      mockCurrentUser.value = null;
    });

    it("stays open when the anonymous user is refetched while open", async () => {
      mockCurrentUser.value = { id: "anon-1", is_anonymous: true };
      const user = userEvent.setup();
      const dialog = () => (
        <AuthDialog
          form={FORM}
          triggerAriaLabel="Open"
          defaultTrigger={<button type="button">Open</button>}
        />
      );
      const { rerender } = renderWithIntl(dialog());

      await user.click(screen.getByRole("button", { name: "Open" }));
      await screen.findByTestId("auth-form");
      // React Query refetches the user (on window focus, for example)
      mockCurrentUser.value = { id: "anon-1", is_anonymous: true };
      rerender(
        <NextIntlClientProvider locale="en" messages={messages}>
          {dialog()}
        </NextIntlClientProvider>,
      );

      expect(screen.getByTestId("auth-form")).toBeInTheDocument();
    });
  });
});
