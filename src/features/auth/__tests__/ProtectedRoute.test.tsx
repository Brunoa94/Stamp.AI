import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { AuthService } from "@/shared/services/authService";
import { ProtectedRoute } from "../ProtectedRoute";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
}));
vi.mock("@/shared/services/authService");
vi.mock("@/shared/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({ handleError: vi.fn(), handleSuccess: vi.fn() }),
}));

function renderProtected() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderWithIntl(
    <QueryClientProvider client={queryClient}>
      <ProtectedRoute fallback={<div>fallback</div>}>
        <div>protected content</div>
      </ProtectedRoute>
    </QueryClientProvider>,
  );
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the fallback and redirects a guest with an anonymous session", async () => {
    vi.mocked(AuthService.getUser).mockResolvedValue({
      id: "anon-1",
      email: "",
      created_at: "2026-10-01T00:00:00Z",
      is_anonymous: true,
    });

    renderProtected();

    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    expect(screen.getByText("fallback")).toBeInTheDocument();
    expect(screen.queryByText("protected content")).not.toBeInTheDocument();
  });

  it("renders the content for a registered user", async () => {
    vi.mocked(AuthService.getUser).mockResolvedValue({
      id: "user-1",
      email: "a@b.c",
      created_at: "2026-10-01T00:00:00Z",
      is_anonymous: false,
    });

    renderProtected();

    expect(await screen.findByText("protected content")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
