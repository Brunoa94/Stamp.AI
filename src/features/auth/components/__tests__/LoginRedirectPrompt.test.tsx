import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useUser } from "@/shared/queries/authQueries";
import { LoginRedirectPrompt } from "../LoginRedirectPrompt";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("redirectedFrom=/orders"),
}));
vi.mock("@/shared/queries/authQueries");
vi.mock("../../login/LoginForm", () => ({
  LoginForm: () => <div data-testid="login-form" />,
}));

function mockUser(user: { id: string; is_anonymous?: boolean } | null) {
  vi.mocked(useUser).mockReturnValue({
    data: user,
    isLoading: false,
  } as unknown as ReturnType<typeof useUser>);
}

describe("LoginRedirectPrompt", () => {
  it("opens the login dialog for a guest with an anonymous session", () => {
    mockUser({ id: "anon-1", is_anonymous: true });

    render(<LoginRedirectPrompt />);

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("stays closed for a registered user", () => {
    mockUser({ id: "user-1", is_anonymous: false });

    render(<LoginRedirectPrompt />);

    expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();
  });
});
